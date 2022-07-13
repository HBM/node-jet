import { Message } from "../daemon/access";
import { jetElement, jetElements, ParamType } from "../element";
import {
  addCore,
  changeCore,
  fetchCore,
  removeCore,
  unfetchCore,
} from "../fetch-common";
import { FetcherFunction, Notification } from "../fetcher";
import { eachKeyValue, isDefined } from "../utils";
import { FetchRule } from "./fetch-chainer";
import JsonRPC, { resultCallback } from "../jsonrpc";

let globalFetchId = 1;

const createFetchDispatcher = (
  params: FetchRule,
  f: Function,
  ref: any
): ((_msg: Message) => void) => {
  if (isDefined(params.sort)) {
    if (params.sort && params.sort.asArray) {
      delete params.sort.asArray; // peer internal param
      const arr: any[] = [];
      const from = params.sort.from || 0;
      return (message: Message) => {
        arr.length = message.params!.n;
        message.params!.changes.forEach((change: { index: number }) => {
          arr[change.index - from] = change;
        });
        f.call(ref, arr, ref);
      };
    } else {
      return (message: Message) => {
        f.call(ref, message.params!.changes, message.params!.n);
      };
    }
  } else {
    return (message: Message) => {
      f.call(ref, message.params, undefined);
    };
  }
};

export type eachFetcherFunction = (
  element: jetElement,
  initElementFetching: (
    arg0: string,
    arg1: FetcherFunction,
    arg2: boolean
  ) => void
) => void;

export class FakePeer {
  fetchers: Record<string, FetcherFunction>;
  id: string;
  eachFetcher: eachFetcherFunction;
  constructor() {
    this.fetchers = {};
    this.id = "fakePeer";
    const eachFetcherIterator = eachKeyValue(this.fetchers);
    this.eachFetcher = (
      element: jetElement,
      initElementFetching: (
        arg0: string,
        arg1: FetcherFunction,
        arg2: boolean
      ) => void
    ) => {
      const hasSetAccess = !element.fetchOnly;
      const initElementFetchingAccess = (
        peerFetchId: string,
        fetcher: FetcherFunction
      ) => {
        initElementFetching("fakePeer" + peerFetchId, fetcher, hasSetAccess);
      };
      eachFetcherIterator(initElementFetchingAccess);
    };
  }

  addFetcher = (fetchId: string, fetcher: FetcherFunction) => {
    this.fetchers[fetchId] = fetcher;
  };

  removeFetcher = (fetchId: string) => {
    delete this.fetchers[fetchId];
  };

  hasFetcher = (fetchId: string) => {
    return (this.fetchers[fetchId] && true) || false;
  };
}

/**
 * FakeFetcher
 *
 * Mimiks normal "fetch" API when the Daemon runs
 * fetch = 'simple' mode. In this case, the Daemon supports
 * only one "fetch all" per Peer.
 * Filtering (value and/or path based) and sorting are handled
 * by the peer.
 *
 * Normally only embedded systems with very limited resources
 * run the fetch = 'simple' mode.
 * @private
 */
export interface iFetcher {
  fetch: () => Promise<object | null>;
  unfetch: () => Promise<object | null>;
  isFetching: () => boolean;
}
export interface FakeContext {
  elements: jetElements;
  peer: FakePeer;
  fetchAllPromise?: Promise<void>;
}
export class FakeFetcher implements iFetcher {
  wrappedFetchDispatcher: (_: Notification) => void;
  fetchSimpleDispatcher: Function;
  fetchParams: ParamType;
  jsonrpc: JsonRPC;
  constructor(
    jsonrpc: JsonRPC,
    fetchParams: ParamType,
    fetchCb: Function,
    asNotification: boolean
  ) {
    this.jsonrpc = jsonrpc;
    this.fetchParams = fetchParams;
    const id = "__f__" + globalFetchId;
    ++globalFetchId;

    fetchParams.id = id;

    let fetchDispatcher: (message: Message) => void;
    this.fetchSimpleDispatcher = () => {};
    this.wrappedFetchDispatcher = (nparams: ParamType) => {
      fetchDispatcher =
        fetchDispatcher || createFetchDispatcher(fetchParams, fetchCb, this);
      fetchDispatcher({
        id: "",
        params: nparams,
      });
    };

    if (jsonrpc.fakeContext === undefined) {
      const newContext: FakeContext = {
        elements: new jetElements(),
        peer: new FakePeer(),
      };
      const context = (jsonrpc.fakeContext = newContext);

      this.fetchSimpleDispatcher = (message: Message) => {
        const event = message.params?.event || {};

        if (event === "remove") {
          removeCore(context.peer as any, context.elements, message.params!);
        } else if (event === "add") {
          addCore(
            context.peer as any,
            context.peer.eachFetcher,
            context.elements,
            message.params!
          );
        } else {
          changeCore(context.peer as any, context.elements, message.params!);
        }
      };

      const fetchCallback = (_: boolean, fetchSimpleId: string) => {
        jsonrpc.addRequestDispatcher(fetchSimpleId, this.fetchSimpleDispatcher);
      };
      context.fetchAllPromise = new Promise((resolve, reject) => {
        jsonrpc
          .service("fetch", {}, fetchCallback, asNotification)
          .then(() => {
            setTimeout(resolve, 50); // wait some time to let the FakeFetcher.elements get filled
          })
          .catch(reject);
      });
    }
  }

  fetch = () => {
    const context = this.jsonrpc.fakeContext;
    return context.fetchAllPromise.then(() => {
      return fetchCore(
        context.peer,
        context.elements,
        this.fetchParams,
        this.wrappedFetchDispatcher,
        null
      );
    });
  };

  unfetch = () => {
    const context = this.jsonrpc.fakeContext;
    return context.fetchAllPromise.then(() => {
      return unfetchCore(context.peer, context.elements, this.fetchParams);
    });
  };

  isFetching = () => {
    const context = this.jsonrpc.fakeContext;
    return context.peer.hasFetcher(this.fetchParams.id);
  };
}

/**
 * Fetcher
 *
 * Sets up a new fetcher. Fetching is very similiar to pub-sub.
 * You can optionally define path- and/or value-based filters
 * and sorting criteria.
 *
 * All options are available at [jetbus.io](http://jetbus.io).
 */
export class Fetcher implements iFetcher {
  fetchDispatcher: Function;
  addFetchDispatcher: resultCallback | undefined = undefined;
  removeFetchDispatcher: resultCallback | undefined = undefined;
  id: string;
  jsonrpc: JsonRPC;
  asNotification = false;
  params: FetchRule;
  constructor(
    jsonrpc: JsonRPC,
    rule: FetchRule,
    fetchCb: Function,
    asNotification: boolean
  ) {
    this.params = rule;
    this.jsonrpc = jsonrpc;
    this.id = "__f__" + globalFetchId;
    this.asNotification = asNotification;
    rule.id = this.id;
    ++globalFetchId;
    this.fetchDispatcher = createFetchDispatcher(rule, fetchCb, this);

    this.addFetchDispatcher = () => {
      jsonrpc.addRequestDispatcher(this.id, this.fetchDispatcher);
    };

    this.removeFetchDispatcher = () => {
      jsonrpc.removeRequestDispatcher(this.id);
    };
  }

  unfetch = () => {
    return this.jsonrpc.service(
      "unfetch",
      {
        id: this.id,
      },
      this.removeFetchDispatcher
    );
  };

  isFetching = () => {
    return this.jsonrpc.hasRequestDispatcher(this.id);
  };

  fetch = () => {
    return this.jsonrpc.service(
      "fetch",
      this.params,
      this.addFetchDispatcher,
      this.asNotification
    );
  };
}
