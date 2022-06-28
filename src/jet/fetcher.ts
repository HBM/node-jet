"use strict";

import { create as createPathMatcher } from "./path_matcher";
import { isDefined } from "./utils";
import { create as createValueMatcher } from "./value_matcher";

export interface Notification {
  fetchOnly?: boolean;
  path: string;
  lowerPath?: any;
  changes?: any;
  event: any;
  value: any;
}
export type FetcherFunction = (
  path: string,
  _lowerPath: string,
  event: any,
  value: any,
  fetchOnly: boolean
) => boolean;
export const create = (
  options: any,
  notify: (_: any) => void
): FetcherFunction => {
  const pathMatcher = createPathMatcher(options);
  const valueMatcher = createValueMatcher(options);
  const added = {} as any;

  const matchValue = (
    path: string,
    event: any,
    value: any,
    fetchOnly: boolean
  ) => {
    const isAdded = added[path];
    if (event === "remove" || (valueMatcher && !valueMatcher(value))) {
      if (isAdded) {
        delete added[path];
        notify({
          path: path,
          event: "remove",
          value: value,
        });
      }
      return true;
    }
    const notification = {} as Notification;
    if (!isAdded) {
      event = "add";
      if (fetchOnly) {
        notification.fetchOnly = true;
      }
      added[path] = true;
    } else {
      event = "change";
    }
    notification.path = path;
    notification.event = event;
    notification.value = value;

    notify(notification);
    return true;
  };

  if (isDefined(pathMatcher) && !isDefined(valueMatcher)) {
    return (
      path: any,
      lowerPath: any,
      event: any,
      value: any,
      fetchOnly: boolean
    ) => {
      if (!pathMatcher || !pathMatcher(path, lowerPath)) {
        // return false to indicate no further interest.
        return false;
      }
      const notification = {} as Notification;
      if (event === "add" && fetchOnly) {
        notification.fetchOnly = true;
      }
      notification.path = path;
      notification.event = event;
      notification.value = value;
      notify(notification);
      return true;
    };
  } else if (!isDefined(pathMatcher) && isDefined(valueMatcher)) {
    return (
      path: string,
      _lowerPath: any,
      event: any,
      value: any,
      fetchOnly: any
    ) => matchValue(path, event, value, fetchOnly);
  } else if (isDefined(pathMatcher) && isDefined(valueMatcher)) {
    return (
      path: string,
      lowerPath: any,
      event: any,
      value: any,
      fetchOnly: any
    ) =>
      !pathMatcher || !pathMatcher(path, lowerPath)
        ? false
        : matchValue(path, event, value, fetchOnly);
  } else {
    return (
      path: string,
      _lowerPath: any,
      event: any,
      value: any,
      fetchOnly: boolean
    ) => {
      const notification = {} as Notification;
      if (event === "add" && fetchOnly) {
        notification.fetchOnly = true;
      }
      notification.path = path;
      notification.event = event;
      notification.value = value;
      notify(notification);
      return true;
    };
  }
};
