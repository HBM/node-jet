// @ts-nocheck
"use strict";

import { create } from "./sorter";
import { create as createFetcher } from "./fetcher";
import { checked, isDefined } from "./utils";

// dispatches the 'fetch' jet call.
// creates a fetch operation and optionally a sorter.
// all elements are inputed as "fake" add events. The
// fetcher is only asociated with the element if
// it "shows interest".
export const fetchCore = (peer, elements, params, notify, success) => {
  const fetchId = checked(params, "id", null);

  let fetcher;
  let sorter;
  let initializing = true;

  if (isDefined(params.sort)) {
    sorter = create(params, notify);
    fetcher = createFetcher(params, (nparams) => {
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
export const unfetchCore = (peer, elements, params) => {
  const fetchId = checked(params, "id", "string");
  const fetchPeerId = peer.id + fetchId;

  peer.removeFetcher(fetchId);
  elements.removeFetcher(fetchPeerId);
};

export const addCore = (peer, eachPeerFetcher, elements, params) => {
  elements.add(eachPeerFetcher, peer, params);
};

export const removeCore = (peer, elements, params) => {
  const path = checked(params, "path", "string");
  elements.remove(path, peer);
};

export const changeCore = (peer, elements, params) => {
  const path = checked(params, "path", "string");
  elements.change(path, params.value, peer);
};
