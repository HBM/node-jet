"use strict";

import { create as createPathMatcher } from "./path_matcher";
import { isDefined } from "./utils";
import { create as createValueMatcher } from "./value_matcher";

export const create = (options, notify) => {
  const pathMatcher = createPathMatcher(options);
  const valueMatcher = createValueMatcher(options);
  const added = {};

  const matchValue = (path, event, value, fetchOnly) => {
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
    const notification = {
      fetchOnly: false,
      path: undefined,
      event: undefined,
      value: undefined,
    };
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
    return (path, lowerPath, event, value, fetchOnly) => {
      if (!pathMatcher(path, lowerPath)) {
        // return false to indicate no further interest.
        return false;
      }
      //TODO create notification type
      const notification = {
        fetchOnly: false,
        path: undefined,
        event: undefined,
        value: undefined,
      };
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
    return (path, _, event, value, fetchOnly) => {
      return matchValue(path, event, value, fetchOnly);
    };
  } else if (isDefined(pathMatcher) && isDefined(valueMatcher)) {
    return (path, lowerPath, event, value, fetchOnly) => {
      if (!pathMatcher(path, lowerPath)) {
        return false;
      }
      return matchValue(path, event, value, fetchOnly);
    };
  } else {
    return (path, _, event, value, fetchOnly) => {
      const notification = {
        fetchOnly: false,
        path: undefined,
        event: undefined,
        value: undefined,
      };
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
