"use strict";

import { create } from "./sorter";
import { create as createFetcher, Notification } from "./fetcher";
import { checked, isDefined } from "./utils";
import { jetElements } from "./element";

// dispatches the 'fetch' jet call.
// creates a fetch operation and optionally a sorter.
// all elements are inputed as "fake" add events. The
// fetcher is only asociated with the element if
// it "shows interest".
export const fetchCore = (
  peer: {
    sendMessage?: any;
    addFetcher?: any;
    id?: any;
  },
  elements: jetElements,
  params: any,
  notify: (_: Notification) => void,
  success: () => void | null
) => {
  const fetchId = checked(params, "id");

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
  elements.addFetcher(peer.id + fetchId, fetcher, peer as any);
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
  peer: { id: any; removeFetcher: (arg0: any) => void },
  elements: jetElements,
  params: {
    path?: { caseInsensitive?: Boolean };
    valueField?: Record<any, any>;
    value?: Record<any, any>;
    sort?: {
      asArray?: Boolean;
      descending?: Boolean;
      byPath?: Boolean;
      byValueField?: Record<any, any>;
      byValue?: Boolean;
      from?: Record<any, any>;
      to?: Record<any, any>;
    };
    id?: any;
  }
) => {
  const fetchId = checked(params, "id", "string");
  const fetchPeerId = peer.id + fetchId;

  peer.removeFetcher(fetchId);
  elements.removeFetcher(fetchPeerId);
};

export const addCore = (
  peer: any,
  eachPeerFetcher: (element: any, f: any) => void,
  elements: jetElements,
  params: any
) => {
  elements.add(eachPeerFetcher as any, peer, params);
};

export const removeCore = (peer: any, elements: jetElements, params: any) => {
  const path = checked(params, "path", "string");
  elements.remove(path, peer);
};

export const changeCore = (
  peer: any,
  elements: jetElements,
  params: { value: any }
) => {
  const path = checked(params, "path", "string");
  elements.change(path, params.value, peer);
};
