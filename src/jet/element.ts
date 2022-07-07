// @ts-nocheck
"use strict";

import { hasAccess, isFetchOnly } from "./daemon/access";
import { PeerType } from "./daemon/peers";
import { FetcherFunction } from "./fetcher";
import Peer from "./peer";
import { invalidParams, eachKeyValue } from "./utils";

export class jetElement {
  fetchers: any;
  fetcherIsReadOnly: boolean;
  eachFetcher: Function;
  peer: PeerType;
  access: any;
  path: string;
  lowerPath: string;
  fetchOnly: boolean;
  value: any;
  logError: any;
  timeout: number;

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
        peerFetchId: string,
        fetcher: FetcherFunction,
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
        id: string,
        fetcher: FetcherFunction
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
  addFetcher = (id: string, fetcher: any, isReadOnly: boolean) => {
    this.fetchers[id] = fetcher;
    this.fetcherIsReadOnly[id] = isReadOnly;
  };
  removeFetcher = (id: string) => {
    delete this.fetchers[id];
    delete this.fetcherIsReadOnly[id];
  };
}

export class jetElements {
  instances: Record<string, jetElement>;
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
    params: { path: string; value?: any; fetchOnly?: boolean; access?: any }
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
  change = (path: string, value: any, peer: PeerType) => {
    const el = this.get(path);
    if (el.peer !== peer) {
      throw invalidParams({
        foreignPath: path,
      });
    } else {
      el.change(value);
    }
  };
  removePeer = (peer: PeerType) => {
    const toDelete: string[] = [];
    this.each(
      (path: string, element: jetElement) => {
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
  remove = (path: string, peer: PeerType) => {
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
    fetcher: FetcherFunction,
    peer: PeerType
  ) => {
    const logError = this.logError;
    this.each(
      (
        path: string,
        element: jetElement
      ) => {
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
