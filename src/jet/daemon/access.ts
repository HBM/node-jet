import { jetElement } from "../element";
import { isDefined } from "../utils";
import { PeerType } from "./peers";

export const intersects = (arrayA: any, arrayB: any) => {
  for (let i = 0; i < arrayA.length; ++i) {
    if (arrayB.indexOf(arrayA[i]) !== -1) {
      return true;
    }
  }
  return false;
};

export const grantAccess = (accessName: string, access: any, auth: any) => {
  const groupName = accessName + "Groups";
  if (access[groupName]) {
    return intersects(access[groupName], auth[groupName]);
  } else {
    return true;
  }
};

export interface Message {
  method?: string;
  params?: any;
  id: string;
  result?: any;
  error?: any;
}
export const hasAccess = (
  accessName: string,
  peer: PeerType,
  element: jetElement
) => {
  if (!isDefined(element.access)) {
    return true;
  } else if (!isDefined(peer.auth)) {
    return false;
  } else {
    return grantAccess(accessName, element.access, peer.auth);
  }
};

export const isFetchOnly = (
  peer: PeerType,
  element: jetElement
) => {
  if (element.fetchOnly) {
    return true;
  } else {
    if (isDefined(element.value)) {
      return !hasAccess("set", peer, element);
    } else {
      return !hasAccess("call", peer, element);
    }
  }
};
