import { isDefined } from "../utils";

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

export const hasAccess = (accessName: string, auth: any, element: any) => {
  if (!isDefined(element.access)) {
    return true;
  } else if (!isDefined(auth)) {
    return false;
  } else {
    return grantAccess(accessName, element.access, auth);
  }
};

export const isFetchOnly = (peer: any, element: any) => {
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
