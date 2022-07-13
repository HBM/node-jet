"use strict";

import { create, SorterType } from "./sorter";
import { create as createFetcher, Notification } from "./fetcher";
import { checked, isDefined } from "./utils";
import { jetElements, ParamType } from "./element";
import { PeerType } from "./daemon/peers";

// dispatches the 'fetch' jet call.
// creates a fetch operation and optionally a sorter.
// all elements are inputed as "fake" add events. The
// fetcher is only asociated with the element if
// it "shows interest".
export const fetchCore = (
  peer: PeerType,
  elements: jetElements,
  params: ParamType,
  notify: (_: Notification) => void,
  success: (() => void) | null
) => {
  const fetchId = checked<string>(params, "id");

  let fetcher;
  let sorter: SorterType;
  let initializing = true;

  if (isDefined(params.sort)) {
    sorter = create(params, notify);
    fetcher = createFetcher(params, (nparams: ParamType) => {
      sorter.sorter(nparams, initializing);
    });
    if (isDefined(sorter) && sorter.flush) {
      if (success) {
        success();
      }
      sorter.flush();
    }
  } else {
    fetcher = createFetcher(params, notify);
    if (success) {
      success();
    }
  }

  peer.addFetcher(fetchId, fetcher);
  elements.addFetcher(peer.id + fetchId, fetcher, peer);
  initializing = false;
};

// dispatchers the 'unfetch' jet call.
// removes all ressources associated with the fetcher.
export const unfetchCore = (
  peer: PeerType,
  elements: jetElements,
  params: ParamType
) => {
  const fetchId = checked<string>(params, "id", "string");
  const fetchPeerId = peer.id + fetchId;

  peer.removeFetcher(fetchId);
  elements.removeFetcher(fetchPeerId);
};

export const addCore = (
  peer: any,
  eachPeerFetcher: any,
  elements: jetElements,
  params: ParamType
) => {
  elements.add(eachPeerFetcher, peer, params);
};

export const removeCore = (
  peer: PeerType,
  elements: jetElements,
  params: ParamType
) => {
  const path = checked<string>(params, "path", "string");
  elements.remove(path, peer);
};

export const changeCore = (
  peer: PeerType,
  elements: jetElements,
  params: ParamType
) => {
  const path = checked<string>(params, "path", "string");
  elements.change(path, params.value, peer);
};
