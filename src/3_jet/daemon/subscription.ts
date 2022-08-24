"use strict";

import JsonRPC from "../../2_jsonrpc";
import { FetchOptions } from "../messages";
import { ValueType } from "../types";
import { createPathMatcher } from "./path_matcher";
import { Route } from "./route";
import { create as createValueMatcher } from "./value_matcher";

export class Subscription {
  owner?: JsonRPC;
  id: string;
  messages: any[] = [];
  routes: Route[] = [];
  pathMatcher: (path: string) => boolean;
  valueMatcher: (value: ValueType | undefined) => boolean;
  constructor(msg: FetchOptions, peer: JsonRPC | undefined = undefined) {
    this.pathMatcher = createPathMatcher(msg);
    this.valueMatcher = createValueMatcher(msg);
    this.owner = peer;
    this.id = msg.id;
  }

  addRoute = (route: Route) => {
    this.routes.push(route);
    if (this.valueMatcher(route.value)) {
      this.enqueue({
        path: route.path,
        event: "Add",
        value: route.value,
      });
    }

    route.addListener("Change", (value) =>
      this.enqueue({ path: route.path, event: "Change", value })
    );
    route.addListener("Remove", () =>
      this.enqueue({ path: route.path, event: "Remove" })
    );
  };
  setRoutes = (routes: Route[]) => {
    routes.forEach((route) => this.addRoute(route));
  };
  matchesPath = (path: string) => this.pathMatcher(path);
  matchesValue = (value: ValueType | undefined) => this.valueMatcher(value);

  enqueue = (msg: object) => {
    this.messages.push(msg);
  };

  send = () => {
    this.messages.forEach((msg) => {
      this.owner?.notify(this.id, msg);
    });
    this.messages = [];
  };
}
