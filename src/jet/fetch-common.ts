// @ts-nocheck
"use strict";

import { create } from "./sorter";
import { create as createFetcher, Notification } from "./fetcher";
import { checked, isDefined } from "./utils";
import { jetElements } from "./element";
import { PeerType } from "./daemon/peers";
import Peer from "./peer";
import { eachFetcherFunction } from "./peer/fetch";

// dispatches the 'fetch' jet call.
// creates a fetch operation and optionally a sorter.
// all elements are inputed as "fake" add events. The
// fetcher is only asociated with the element if
// it "shows interest".
export const fetchCore = (
  peer: PeerType,
  elements: jetElements,
  params: any,
  notify: (_: Notification) => void,
  success: (() => void) | null
) => {
  const fetchId = checked<string>(params, "id");

  let fetcher;
  let sorter: any;
  let initializing = true;

  if (isDefined(params.sort)) {
    sorter = create(params, notify);
    fetcher = createFetcher(params, (nparams: any) => {
      sorter.sorter(nparams, initializing);
    });
  } else {
    fetcher = createFetcher(params, notify);
    if (success) {
      success();
    }
  }

  peer.addFetcher(fetchId, fetcher);
  elements.addFetcher(peer.id + fetchId, fetcher, peer);
  initializing = false;

  if (isDefined(sorter) && sorter.flush) {
    if (success) {
      success();
    }
    sorter.flush();
  }
};

// dispatchers the 'unfetch' jet call.
// removes all ressources associated with the fetcher.
export const unfetchCore = (
  peer: PeerType,
  elements: jetElements,
  params: any
) => {
  const fetchId = checked<string>(params, "id", "string");
  const fetchPeerId = peer.id + fetchId;

  peer.removeFetcher(fetchId);
  elements.removeFetcher(fetchPeerId);
};

export const addCore = (
  peer: any,
  eachPeerFetcher: eachFetcherFunction,
  elements: jetElements,
  params: any
) => {
  elements.add(eachPeerFetcher as any, peer, params);
};

export const removeCore = (peer: any, elements: jetElements, params: any) => {
  const path = checked<string>(params, "path", "string");
  elements.remove(path, peer);
};

export const changeCore = (peer: any, elements: jetElements, params: any) => {
  const path = checked<string>(params, "path", "string");
  elements.change(path, params.value, peer);
};
