"use strict";

import { hasAccess, isFetchOnly } from "./daemon/access";
import { PeerType } from "./daemon/peers";
import Peer from "./peer";
import { invalidParams, eachKeyValue } from "./utils";

export class jetElement {
  fetchers: any;
  fetcherIsReadOnly: any;
  eachFetcher: Function;
  peer: any;
  access: any;
  path: string;
  lowerPath: any;
  fetchOnly: any;
  value: any;
  logError: any;
  timeout: any;

  constructor(
    eachPeerFetcherWithAccess: any,
    owningPeer: Record<any, any>,
    params: any,
    logError: any
  ) {
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

    eachPeerFetcherWithAccess(
      this,
      (
        peerFetchId: string | number,
        fetcher: (
          arg0: any,
          arg1: any,
          arg2: string,
          arg3: any,
          arg4: any
        ) => any,
        hasSetAccess: boolean
      ) => {
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
      }
    );
  }
  _publish = (event: string) => {
    const lowerPath = this.lowerPath;
    const value = this.value;
    const path = this.path;
    const isReadOnly = this.fetcherIsReadOnly;
    const logError = this.logError;
    this.eachFetcher(
      (
        id: string | number,
        fetcher: (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any) => void
      ) => {
        try {
          fetcher(path, lowerPath, event, value, isReadOnly[id]);
        } catch (err) {
          logError(err);
        }
      }
    );
  };
  change = (value: any) => {
    this.value = value;
    this._publish("change");
  };
  remove = () => {
    this._publish("remove");
  };
  addFetcher = (id: string | number, fetcher: any, isReadOnly: any) => {
    this.fetchers[id] = fetcher;
    this.fetcherIsReadOnly[id] = isReadOnly;
  };
  removeFetcher = (id: string | number) => {
    delete this.fetchers[id];
    delete this.fetcherIsReadOnly[id];
  };
}

export class jetElements {
  instances: Record<any, jetElement>;
  log: Function;
  each: Function;

  constructor(log: any | null) {
    this.instances = {};
    this.log = log || console.log;
    this.logError = this.logError.bind(this);
    this.each = eachKeyValue(this.instances);
  }
  logError = (err: { stack: any }) => {
    this.log("fetcher failed:", err);
    this.log("Trace:", err.stack);
  };
  add = (
    peers: PeerType,
    owningPeer: Peer,
    params: { path: string; value?: any; fetchOnly?: any; access?: any }
  ) => {
    const path = params.path;
    if (this.instances[path]) {
      throw invalidParams({
        pathAlreadyExists: path,
      });
    } else {
      this.instances[path] = new jetElement(
        peers,
        owningPeer,
        params as any,
        this.logError as any
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
  change = (path: string, value: any, peer: any) => {
    const el = this.get(path);
    if (el.peer !== peer) {
      throw invalidParams({
        foreignPath: path,
      });
    } else {
      el.change(value);
    }
  };
  removePeer = (peer: any) => {
    const toDelete: any[] = [];
    this.each(
      (path: any, element: { peer: any; remove: (arg0: any) => void }) => {
        if (element.peer === peer) {
          element.remove(path);
          toDelete.push(path);
        }
      }
    );
    const instances = this.instances;
    toDelete.forEach((path) => {
      delete instances[path];
    });
  };
  remove = (path: string, peer: any) => {
    const el = this.get(path);
    if (el.peer !== peer) {
      throw invalidParams({
        foreignPath: path,
      });
    }
    el.remove();
    delete this.instances[path];
  };
  addFetcher = (
    id: string,
    fetcher: (
      path: string,
      lowerPath: string,
      event: any,
      value: any,
      fetchOnly: boolean
    ) => boolean,
    peer: {
      fetchingSimple: boolean;
      sendMessage: any;
      addFetcher: any;
      id: string;
    }
  ) => {
    const logError = this.logError;
    this.each(
      (
        path: string,
        element: {
          value: any;
          addFetcher: (arg0: any, arg1: any, arg2: boolean) => void;
        }
      ) => {
        if (hasAccess("fetch", peer, element as any)) {
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
            logError(err as any);
          }
        }
      }
    );
  };
  removeFetcher = (id: string) => {
    this.each((_: any, element: { removeFetcher: (arg0: any) => void }) => {
      element.removeFetcher(id);
    });
  };
}
