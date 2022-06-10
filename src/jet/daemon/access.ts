import { isDefined } from "../utils";

export const intersects = (arrayA, arrayB) => {
  for (let i = 0; i < arrayA.length; ++i) {
    if (arrayB.indexOf(arrayA[i]) !== -1) {
      return true;
    }
  }
  return false;
};

export const grantAccess = (accessName, access, auth) => {
  const groupName = accessName + "Groups";
  if (access[groupName]) {
    return intersects(access[groupName], auth[groupName]);
  } else {
    return true;
  }
};

export const hasAccess = (accessName, peer, element) => {
  if (!isDefined(element.access)) {
    return true;
  } else if (!isDefined(peer.auth)) {
    return false;
  } else {
    return grantAccess(accessName, element.access, peer.auth);
  }
};

export const isFetchOnly = (peer, element) => {
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
