import { jetElement, ParamType } from "../element";
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
  params?: ParamType;
  id: string;
}
export interface ErrorMessage extends Message {
  error: any;
}
export interface ServiceMessage extends Message {
  method: string;
}
export interface ResultMessage extends Message {
  result: any;
}
export const isErrorMessage = (message: Message): message is ErrorMessage => {
  return "error" in message;
};
export const isServiceMessage = (
  message: Message
): message is ServiceMessage => {
  return "method" in message;
};
export const isResultMessage = (message: Message): message is ResultMessage => {
  return "result" in message;
};

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

export const isFetchOnly = (peer: PeerType, element: jetElement) => {
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
