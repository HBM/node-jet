// @ts-nocheck
"use strict";

import { hasAccess, isFetchOnly } from "./daemon/access";
import { PeerType } from "./daemon/peers";
import Peer from "./peer";
import { invalidParams, eachKeyValue } from "./utils";

export class jetElement {
  fetchers: Object;
  fetcherIsReadOnly: Object;
  eachFetcher: Function;
  peer: Object;
  access: any;
  path: any;
  lowerPath: any;
  fetchOnly: any;
  value: any;
  logError: any;

  constructor(eachPeerFetcherWithAccess, owningPeer, params, logError) {
    this.fetchers = {};
    this.fetcherIsReadOnly = {};
    this.eachFetcher = eachKeyValue(this.fetchers);
    const path = (this.path = params.path);
    const lowerPath = (this.lowerPath = path.toLowerCase());
    const value = (this.value = params.value);
    const fetchOnly = (this.fetchOnly = params.fetchOnly);
    this.peer = owningPeer;
    this.access = params.access;

    const fetchers = this.fetchers;
    const fetcherIsReadOnly = this.fetcherIsReadOnly;
    this.logError = logError;

    eachPeerFetcherWithAccess(this, (peerFetchId, fetcher, hasSetAccess) => {
      try {
        const isReadOnly = fetchOnly || !hasSetAccess;
        const mayHaveInterest = fetcher(
          path,
          lowerPath,
          "add",
          value,
          isReadOnly
        );
        if (mayHaveInterest) {
          fetchers[peerFetchId] = fetcher;
          fetcherIsReadOnly[peerFetchId] = isReadOnly;
        }
      } catch (err) {
        logError(err);
      }
    });
  }
  _publish = (event) => {
    const lowerPath = this.lowerPath;
    const value = this.value;
    const path = this.path;
    const isReadOnly = this.fetcherIsReadOnly;
    const logError = this.logError;
    this.eachFetcher((id, fetcher) => {
      try {
        fetcher(path, lowerPath, event, value, isReadOnly[id]);
      } catch (err) {
        logError(err);
      }
    });
  };
  change = (value) => {
    this.value = value;
    this._publish("change");
  };
  remove = () => {
    this._publish("remove");
  };
  addFetcher = (id, fetcher, isReadOnly) => {
    this.fetchers[id] = fetcher;
    this.fetcherIsReadOnly[id] = isReadOnly;
  };
  removeFetcher = (id) => {
    delete this.fetchers[id];
    delete this.fetcherIsReadOnly[id];
  };
}

export class jetElements {
  instances: jetElement[];
  log: Function;
  each: Function;

  constructor(log) {
    this.instances = [];
    this.log = log || console.log;
    this.logError = this.logError.bind(this);
    this.each = eachKeyValue(this.instances);
  }
  logError = (err) => {
    this.log("fetcher failed:", err);
    this.log("Trace:", err.stack);
  };
  add = (peers: PeerType, owningPeer: Peer, params: Para) => {
    const path = params.path;
    if (this.instances[path]) {
      throw invalidParams({
        pathAlreadyExists: path,
      });
    } else {
      this.instances[path] = new jetElement(
        peers,
        owningPeer,
        params,
        this.logError
      );
    }
  };
  get = (path: string) => {
    const el = this.instances[path];
    if (!el) {
      throw invalidParams({
        pathNotExists: path,
      });
    } else {
      return el;
    }
  };
  change = (path, value, peer) => {
    const el = this.get(path);
    if (el.peer !== peer) {
      throw invalidParams({
        foreignPath: path,
      });
    } else {
      el.change(value);
    }
  };
  removePeer = (peer) => {
    const toDelete: any[] = [];
    this.each((path, element) => {
      if (element.peer === peer) {
        element.remove(path);
        toDelete.push(path);
      }
    });
    const instances = this.instances;
    toDelete.forEach((path) => {
      delete instances[path];
    });
  };
  remove = (path, peer) => {
    const el = this.get(path);
    if (el.peer !== peer) {
      throw invalidParams({
        foreignPath: path,
      });
    }
    el.remove();
    delete this.instances[path];
  };
  addFetcher = (id, fetcher, peer) => {
    const logError = this.logError;
    this.each((path, element) => {
      if (hasAccess("fetch", peer, element)) {
        let mayHaveInterest;
        try {
          const isReadOnly = isFetchOnly(peer, element);
          mayHaveInterest = fetcher(
            path,
            path.toLowerCase(),
            "add",
            element.value,
            isReadOnly
          );
          if (mayHaveInterest) {
            element.addFetcher(id, fetcher, isReadOnly);
          }
        } catch (err) {
          logError(err);
        }
      }
    });
  };
  removeFetcher = (id) => {
    this.each((_, element) => {
      element.removeFetcher(id);
    });
  };
}
