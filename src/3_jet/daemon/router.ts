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
export class FetchRule {
  matches: (path: string) => boolean;
  owner: JsonRPC;
  id: string;
  constructor(msg: FetchRequest, peer: JsonRPC) {
    this.matches = createPathMatcher(msg.params);
    this.owner = peer;
    this.id = msg.id;
  }
}
export class Route {
  owner: JsonRPC;
  subscriptions: Subscription[] = [];

  constructor(owner: JsonRPC) {
    this.owner = owner;
  }

  addSubscription = (subscription: Subscription) =>
    this.subscriptions.push(subscription);

  unsubscribe = (subscription: Subscription) =>{
    console.log("Unsubscribing")
    this.subscriptions.filter((sub) => sub !== subscription);
  }
  

  
  publish = (message: UpdateRequest) => {
      const invalidSubscriptions:Subscription[] = []

      return Promise.all(this.subscriptions.map(async (sub) => {
        if (sub.hasIntrest(message.params.value))
          return await sub.owner.publish(sub.fetchId,{method:message.method,path:message.params.path,value:message.params.value}).catch(()=>{
            invalidSubscriptions.push(sub)
          })})).then((res)=>{
            this.subscriptions= this.subscriptions.filter((sub)=>!invalidSubscriptions.includes(sub))
            return Promise.resolve(res)
          })
     
    
  };
}

export class Router extends EventEmitter.EventEmitter {
  routes: Record<string, Route> = {};
  fetcher: FetchRule[] = [];
  constructor(daemon: Daemon) {
    super();
    daemon.addListener("add", this.handleAdd);
    daemon.addListener("remove", this.handleRemove);
    daemon.addListener("fetch", this.handleFetch);
    daemon.addListener("unfetch", this.handleUnfetch);
    daemon.addListener("update", this.handleChange);
  }

  hasRoute = (route: string) => route in this.routes;
  filterRoutesByPeer = (peer: JsonRPC): string[] =>
    Object.entries(this.routes)
      .filter(([_path, route]) => route.owner === peer)
      .map((el) => el[0]);

  deleteFetcher = (peer: JsonRPC): void =>{
    this.fetcher = this.fetcher
    .filter((fetcher) => fetcher.owner === peer)
  }
 
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
    this.fetcher.forEach((fetchRule) => {
      if (fetchRule.matches(msg.params.path)) {
        const sub = new Subscription(fetchRule.owner, fetchRule.id);
        this.routes[msg.params.path].addSubscription(sub);
        fetchRule.owner.send(fetchRule.id, msg.params);
      }
    });
  };
  handleChange = (msg: UpdateRequest) => {
    this.routes[msg.params.path].publish(msg);
  };
  handleFetch = (msg: FetchRequest, peer: JsonRPC): Promise<object> => {
    const matcher = createPathMatcher(msg.params);
    this.fetcher.push(new FetchRule(msg, peer));
    return Promise.all<object>(
      Object.keys(this.routes).filter((route)=>matcher(route)).map( async (route: string) => {
          const sub = new Subscription(peer, msg.id);
          this.routes[route].addSubscription(sub);
          return await this.routes[route].owner.send<object>("get", { path: route })
      })
    )
  };
  handleUnfetch = (_owner: Peer) => {
    console.log("Removing fetch");
  };
  handleRemove = (_route: string) => {
    console.log("Removing Route");
  };
}
