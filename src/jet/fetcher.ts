"use strict";

import { create as createPathMatcher } from "./path_matcher";
import { isDefined } from "./utils";
import { create as createValueMatcher } from "./value_matcher";

export interface Notification {
  fetchOnly?: boolean;
  path: any;
  lowerPath?: any;
  changes?: any;
  event: any;
  value: any;
}
export const create = (options: any, notify: (_: Notification) => void) => {
  const pathMatcher = createPathMatcher(options);
  const valueMatcher = createValueMatcher(options);
  const added: any = {};

  const matchValue = (n: Notification) => {
    const isAdded = added[n.path];
    let newN = { ...n };
    if (n.event === "remove" || (valueMatcher && !valueMatcher(n.value))) {
      if (isAdded) {
        delete added[n.path];
        notify(newN);
      }
      return true;
    }

    if (!isAdded) {
      newN.event = "add";
      added[n.path] = true;
    } else {
      newN.event = "change";
    }
    notify(newN);
    return true;
  };

  if (isDefined(pathMatcher) && !isDefined(valueMatcher)) {
    return (n: Notification) => {
      console.log("Notification:", n);
      if (pathMatcher && !pathMatcher(n)) {
        // return false to indicate no further interest.
        return false;
      }

      if (n.event === "add" && n.fetchOnly) {
        n.fetchOnly = true;
      }
      notify({ ...n });
      return true;
    };
  } else if (!isDefined(pathMatcher) && isDefined(valueMatcher)) {
    return (n: Notification) => {
      return matchValue(n);
    };
  } else if (isDefined(pathMatcher) && isDefined(valueMatcher)) {
    return (n: Notification) => {
      console.log("Notification:", n);
      if (pathMatcher && !pathMatcher(n)) {
        return false;
      }
      return matchValue(n);
    };
  } else {
    return (n: Notification) => {
      if (n.event === "add" && n.fetchOnly) {
        n.fetchOnly = true;
      }
      notify({ ...n });
      return true;
    };
  }
};
