"use strict";

import EventEmitter from "events";
import Daemon from ".";
import JsonRPC from "../../2_jsonrpc";
import { invalidParams } from "../errors";
import {
  AddRequest,
  FetchRequest,
  GetRequest,
  UpdateRequest,
} from "../messages";
import Peer from "../peer";
import { ValueType } from "../types";
import { createPathMatcher } from "./path_matcher";

export class Subscription {
  owner: JsonRPC;
  fetchId: string;
  rule: any;
  constructor(owner: JsonRPC, fetchId: string, rule: any = {}) {
    this.owner = owner;
    this.fetchId = fetchId;
    this.rule = rule;
  }

  hasIntrest = (_value: ValueType | undefined) => {
    return true;
  };
}
export class Route {
  owner: JsonRPC;
  subscriptions: Subscription[] = [];

  constructor(owner: JsonRPC) {
    this.owner = owner;
  }

  addSubscription = (subscription: Subscription) =>
    this.subscriptions.push(subscription);

  unsubscribe = (subscription: Subscription) =>
    this.subscriptions.filter((sub) => sub !== subscription);

  publish = (message: UpdateRequest) => {
    this.subscriptions.forEach((sub) => {
      if (sub.hasIntrest(message.params.value))
        sub.owner.send(sub.fetchId, message);
    });
  };
}

export class Router extends EventEmitter.EventEmitter {
  routes: Record<string, Route> = {};
  fetcher: Record<string, Route> = {};
  constructor(daemon: Daemon) {
    super();
    daemon.addListener("add", this.handleAdd);
    daemon.addListener("fetch", this.handleFetch);
    daemon.addListener("update", this.handleChange);
    daemon.addListener("remove", this.handleRemove);
  }

  hasRoute = (route: string) => route in this.routes;
  filterRoutesByPeer = (peer: JsonRPC): string[] =>
    Object.entries(this.routes)
      .filter(([_path, route]) => route.owner === peer)
      .map((el) => el[0]);

  deleteRoute = (route: string) => {
    delete this.routes[route];
  };
  deleteRoutes = (routes: string[]) => {
    routes.forEach((route) => this.deleteRoute(route));
  };

  forward = (route: string, msg: GetRequest) => {
    if (!this.hasRoute(msg.params.path)) {
      return Promise.reject(invalidParams("Path not registered"));
    }
    return this.routes[route].owner.send(msg.method, msg.params);
  };
  handleAdd = (msg: AddRequest, owner: JsonRPC) => {
    this.routes[msg.params.path] = new Route(owner);
    this.emit("Added", msg);
  };
  handleChange = (msg: UpdateRequest) => {
    this.routes[msg.params.path].publish(msg);
  };
  handleFetch = (msg: FetchRequest, peer: JsonRPC) => {
    const matcher = createPathMatcher(msg.params);
    this.addListener("Added", (addMsg: AddRequest) => {
      const route = addMsg.params.path;
      if (matcher(route)) {
        const sub = new Subscription(peer, msg.id);
        this.routes[route].addSubscription(sub);
        peer.send(msg.id, addMsg.params);
      }
    });
    Object.keys(this.routes).forEach((route: string) => {
      if (matcher(route)) {
        const sub = new Subscription(peer, msg.id);
        this.routes[route].addSubscription(sub);
        this.routes[route].owner
          .send("get", { path: route })
          .then((response) => {
            peer.send(msg.id, response);
          });
      }
    });
  };
  handleUnfetch = (_owner: Peer) => {
    console.log("Removing fetch");
  };
  handleRemove = (_route: string) => {
    console.log("Removing Route");
  };

  handleUpdate = () => {
    console.log("Adding new Route");
  };
}
