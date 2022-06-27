import { jetElement } from "../element";
import { isDefined } from "../utils";

export const intersects = (arrayA: string | any[], arrayB: string | any[]) => {
  for (let i = 0; i < arrayA.length; ++i) {
    if (arrayB.indexOf(arrayA[i]) !== -1) {
      return true;
    }
  }
  return false;
};

export const grantAccess = (
  accessName: string,
  access: { [x: string]: any },
  auth: { [x: string]: any }
) => {
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
  id: any;
  result?: any;
  error?: any;
}
export const hasAccess = (
  accessName: string,
  peer: {
    fetchingSimple?: boolean;
    sendMessage?: (arg0: Message) => void;
    addFetcher?: (
      arg0: string,
      arg1: (
        path: any,
        lowerPath: any,
        event: any,
        value: any,
        fetchOnly: any
      ) => boolean
    ) => void;
    id?: string;
    auth?: any;
  },
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
  peer: {
    fetchingSimple: boolean;
    sendMessage: (arg0: Message) => void;
    addFetcher: (
      arg0: string,
      arg1: (
        path: any,
        lowerPath: any,
        event: any,
        value: any,
        fetchOnly: any
      ) => boolean
    ) => void;
    id: string;
  },
  element: {
    value: any;
    addFetcher?: (arg0: any, arg1: any, arg2: boolean) => void;
    fetchOnly?: any;
  }
) => {
  if (element.fetchOnly) {
    return true;
  } else {
    if (isDefined(element.value)) {
      return !hasAccess("set", peer, element as any);
    } else {
      return !hasAccess("call", peer, element as any);
    }
  }
};
