import { jetElements } from "../element";
import {
  addCore,
  changeCore,
  fetchCore,
  removeCore,
  unfetchCore,
} from "../fetch-common";
import { eachKeyValue, isDefined } from "../utils";
import JsonRPC from "./jsonrpc";

let globalFetchId = 1;

const createFetchDispatcher = (params, f, ref) => {
  if (isDefined(params.sort)) {
    if (params.sort.asArray) {
      delete params.sort.asArray; // peer internal param
      const arr: any[] = [];
      const from = params.sort.from;
      return (message) => {
        arr.length = message.params.n;
        message.params.changes.forEach((change) => {
          arr[change.index - from] = change;
        });
        f.call(ref, arr, ref);
      };
    } else {
      return (message) => {
        f.call(ref, message.params.changes, message.params.n);
      };
    }
  } else {
    return (message) => {
      f.call(ref, message.params);
    };
  }
};

export class FakePeer {
  fetchers: Object;
  id: String;
  eachFetcher: Function;
  constructor() {
    this.fetchers = {};
    this.id = "fakePeer";
    const eachFetcherIterator = eachKeyValue(this.fetchers);
    this.eachFetcher = (element, initElementFetching) => {
      const hasSetAccess = !element.fetchOnly;
      const initElementFetchingAccess = (peerFetchId, fetcher) => {
        initElementFetching("fakePeer" + peerFetchId, fetcher, hasSetAccess);
      };
      eachFetcherIterator(initElementFetchingAccess);
    };
  }

  addFetcher = (fetchId, fetcher) => {
    this.fetchers[fetchId] = fetcher;
  };

  removeFetcher = (fetchId) => {
    delete this.fetchers[fetchId];
  };

  hasFetcher = (fetchId) => {
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
  wrappedFetchDispatcher: Function;
  fetchSimpleDispatcher: Function;
  fetchParams;
  jsonrpc;
  constructor(jsonrpc, fetchParams, fetchCb, asNotification) {
    this.jsonrpc = jsonrpc;
    this.fetchParams = fetchParams;
    const id = "__f__" + globalFetchId;
    ++globalFetchId;

    fetchParams.id = id;

    let fetchDispatcher;
    this.fetchSimpleDispatcher = () => {};
    this.wrappedFetchDispatcher = (nparams) => {
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

      this.fetchSimpleDispatcher = (message) => {
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
            (_, fetchSimpleId) => {
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
    | ((completed: boolean, result?: Object) => void)
    | undefined = undefined;
  removeFetchDispatcher:
    | ((completed: boolean, result?: Object) => void)
    | undefined = undefined;
  id: String;
  jsonrpc: JsonRPC;
  asNotification = true;
  params;
  constructor(jsonrpc, params, fetchCb, asNotification) {
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
