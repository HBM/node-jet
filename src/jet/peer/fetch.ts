import { jetElements } from "../element";
import {
  addCore,
  changeCore,
  fetchCore,
  removeCore,
  unfetchCore,
} from "../fetch-common";
import { Notification } from "../fetcher";
import { eachKeyValue, isDefined } from "../utils";
import JsonRPC from "./jsonrpc";

let globalFetchId = 1;

const createFetchDispatcher = (params: any, f: any, ref: any) => {
  if (isDefined(params.sort)) {
    if (params.sort.asArray) {
      delete params.sort.asArray; // peer internal param
      const arr: any[] = [];
      const from = params.sort.from;
      return (message: { params: { n: number; changes: any[] } }) => {
        arr.length = message.params.n;
        message.params.changes.forEach((change: { index: number }) => {
          arr[change.index - from] = change;
        });
        f.call(ref, arr, ref);
      };
    } else {
      return (message: { params: { changes: any; n: any } }) => {
        f.call(ref, message.params.changes, message.params.n);
      };
    }
  } else {
    return (message: { params: any }) => {
      f.call(ref, message.params, undefined);
    };
  }
};

export class FakePeer {
  fetchers: Record<any, any>;
  id: String;
  eachFetcher: Function;
  constructor() {
    this.fetchers = {};
    this.id = "fakePeer";
    const eachFetcherIterator = eachKeyValue(this.fetchers);
    this.eachFetcher = (
      element: { fetchOnly: any },
      initElementFetching: (arg0: string, arg1: any, arg2: boolean) => void
    ) => {
      const hasSetAccess = !element.fetchOnly;
      const initElementFetchingAccess = (peerFetchId: string, fetcher: any) => {
        initElementFetching("fakePeer" + peerFetchId, fetcher, hasSetAccess);
      };
      eachFetcherIterator(initElementFetchingAccess);
    };
  }

  addFetcher = (fetchId: string | number, fetcher: any) => {
    this.fetchers[fetchId] = fetcher;
  };

  removeFetcher = (fetchId: string | number) => {
    delete this.fetchers[fetchId];
  };

  hasFetcher = (fetchId: string | number) => {
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
export class FakeFetcher {
  wrappedFetchDispatcher: (_: Notification) => void;
  fetchSimpleDispatcher: Function;
  fetchParams: any;
  jsonrpc: any;
  constructor(
    jsonrpc: {
      fakeContext: any;
      service: (
        arg0: string,
        arg1: {},
        arg2: (_: any, fetchSimpleId: any) => void,
        arg3: any
      ) => Promise<any>;
      addRequestDispatcher: (arg0: any, arg1: Function) => void;
    },
    fetchParams: any,
    fetchCb: any,
    asNotification: any
  ) {
    this.jsonrpc = jsonrpc;
    this.fetchParams = fetchParams;
    const id = "__f__" + globalFetchId;
    ++globalFetchId;

    fetchParams.id = id;

    let fetchDispatcher: (arg0: { params: any }) => void;
    this.fetchSimpleDispatcher = () => {};
    this.wrappedFetchDispatcher = (nparams: any) => {
      fetchDispatcher =
        fetchDispatcher || createFetchDispatcher(fetchParams, fetchCb, this);
      fetchDispatcher({
        params: nparams,
      });
    };

    if (jsonrpc.fakeContext === undefined) {
      const context = (jsonrpc.fakeContext = {
        elements: undefined as any,
        peer: undefined as any,
        fetchAllPromise: undefined as any,
      });
      context.elements = new jetElements(null);
      context.peer = new FakePeer();

      this.fetchSimpleDispatcher = (message: { params: any }) => {
        const params = message.params;
        const event = params.event;

        if (event === "remove") {
          removeCore(context.peer, context.elements, params);
        } else if (event === "add") {
          addCore(
            context.peer,
            context.peer.eachFetcher,
            context.elements,
            params
          );
        } else {
          changeCore(context.peer, context.elements, params);
        }
      };

      context.fetchAllPromise = new Promise((resolve, reject) => {
        jsonrpc
          .service(
            "fetch",
            {},
            (_: any, fetchSimpleId: any) => {
              jsonrpc.addRequestDispatcher(
                fetchSimpleId,
                this.fetchSimpleDispatcher
              );
            },
            asNotification
          )
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
export class Fetcher {
  fetchDispatcher: Function;
  addFetchDispatcher:
    | ((completed: boolean, result?: Record<any, any>) => void)
    | undefined = undefined;
  removeFetchDispatcher:
    | ((completed: boolean, result?: Record<any, any>) => void)
    | undefined = undefined;
  id: String;
  jsonrpc: JsonRPC;
  asNotification = true;
  params: any;
  constructor(
    jsonrpc: JsonRPC,
    params: {
      path?: { caseInsensitive?: Boolean | undefined } | undefined;
      valueField?: Record<any, any> | undefined;
      value?: Record<any, any> | undefined;
      sort?:
        | {
            asArray?: Boolean | undefined;
            descending?: Boolean | undefined;
            byPath?: Boolean | undefined;
            byValueField?: Record<any, any> | undefined;
            byValue?: Boolean | undefined;
            from?: Record<any, any> | undefined;
            to?: Record<any, any> | undefined;
          }
        | undefined;
      id?: any;
    },
    fetchCb: any,
    asNotification: boolean
  ) {
    this.params = params;
    this.jsonrpc = jsonrpc;
    this.id = "__f__" + globalFetchId;
    this.asNotification = asNotification;
    params.id = this.id;
    ++globalFetchId;
    this.fetchDispatcher = createFetchDispatcher(params, fetchCb, this);

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
