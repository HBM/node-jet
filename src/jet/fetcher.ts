"use strict";

import { ValueType } from "./element";
import { create as createPathMatcher } from "./path_matcher";
import { isDefined } from "./utils";
import { create as createValueMatcher } from "./value_matcher";

export interface Notification {
  fetchOnly?: boolean;
  path: string;
  lowerPath?: string;
  changes?: any;
  event: EventType;
  value: ValueType;
}
export type EventType = "remove" | "change" | "add" | "data" | "call" | "set";
export type FetcherFunction = (
  path: string,
  _lowerPath: string,
  event: EventType,
  value: ValueType,
  fetchOnly: boolean
) => boolean;
export const create = (
  options: any,
  notify: (_: Notification) => void
): FetcherFunction => {
  const pathMatcher = createPathMatcher(options);
  const valueMatcher = createValueMatcher(options);
  const added: Record<string, boolean> = {};

  const matchValue = (
    path: string,
    event: EventType,
    value: ValueType,
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
      path: string,
      lowerPath: string,
      event: EventType,
      value: ValueType,
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
      _lowerPath: string,
      event: EventType,
      value: ValueType,
      fetchOnly: boolean
    ) => matchValue(path, event, value, fetchOnly);
  } else if (isDefined(pathMatcher) && isDefined(valueMatcher)) {
    return (
      path: string,
      lowerPath: string,
      event: EventType,
      value: ValueType,
      fetchOnly: boolean
    ) =>
      !pathMatcher || !pathMatcher(path, lowerPath)
        ? false
        : matchValue(path, event, value, fetchOnly);
  } else {
    return (
      path: string,
      _lowerPath: string,
      event: EventType,
      value: ValueType,
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
