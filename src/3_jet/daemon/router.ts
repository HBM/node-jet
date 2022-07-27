"use strict";

import EventEmitter from "events";
import Daemon from ".";
import JsonRPC from "../../2_jsonrpc";
import { invalidParams } from "../errors";
import {
  AddRequest,
  CallRequest,
  FetchRequest,
  GetRequest,
  RemoveRequest,
  SetRequest,
  UnFetchRequest,
  UpdateRequest,
} from "../messages";
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
    this.id = msg.params.id;
  }
}
export class Route {
  owner: JsonRPC;
  subscriptions: Subscription[] = [];
  value?: ValueType
  constructor(owner: JsonRPC, value: ValueType|undefined= undefined) {
    this.owner = owner;
    this.value=value
  }

  addSubscription = (subscription: Subscription) =>
    this.subscriptions.push(subscription);

  removeFetcher = (fetchId: string) =>{
    this.subscriptions = this.subscriptions.filter((sub) => sub.fetchId !== fetchId);
  }

  publish = (message: UpdateRequest| RemoveRequest | AddRequest) => {
      const invalidSubscriptions:Subscription[] = []
      return Promise.all(this.subscriptions.map(async (sub) => {
        if (message.method ==="remove" || message.method==="add" ||sub.hasIntrest(this.value)){
          const params:any = {method:message.method,path:message.params.path}
          if("value" in message.params)params.value=message.params.value
          return await sub.owner.publish(sub.fetchId,params).catch(()=>{
            invalidSubscriptions.push(sub)
          }).then(()=>{
            this.subscriptions= this.subscriptions.filter((sub)=>!invalidSubscriptions.includes(sub))
            return Promise.resolve({})
          })
        }}))
  }
}

export class Router extends EventEmitter.EventEmitter {
  routes: Record<string, Route> = {};
  fetcher: FetchRule[] = [];
  constructor(daemon: Daemon) {
    super();
    daemon.addListener("add", this.handleAdd);
    daemon.addListener("remove", this.handleRemove);
    daemon.addListener("fetch", (msg: FetchRequest, peer: JsonRPC) =>setTimeout(()=>this.handleFetch(msg,peer),10));
    daemon.addListener("get", this.handleGet);
    daemon.addListener("unfetch", this.handleUnfetch);
    daemon.addListener("update", this.handleChange);
    daemon.addListener("forward", this.forward);
  }

  hasRoute = (route: string) => route in this.routes;

  filterRoutesByPeer = (peer: JsonRPC): string[] =>
    Object.entries(this.routes)
      .filter(([_path, route]) => route.owner === peer)
      .map((el) => el[0]);

  deleteFetcher = (peer: JsonRPC): void =>{
    this.fetcher = this.fetcher.filter((fetcher) => fetcher.owner === peer)
  }
 
  deleteRoute = (route: string) => {
    this.routes[route].publish({method:"remove",params:{path:route},id:""})
    delete this.routes[route];
  };
  deleteRoutes = (routes: string[]) => {
    routes.forEach((route) => this.deleteRoute(route));
  };

  forward = (route: string, msg: SetRequest|CallRequest) => {
    if (!this.hasRoute(msg.params.path)) {
      return Promise.reject(invalidParams("Path not registered"));
    }
    return this.routes[route].owner.send(msg.method, msg.params);
  };
  handleAdd = (msg: AddRequest, owner: JsonRPC) => {
    this.routes[msg.params.path] = new Route(owner,msg.params.value);
    //If added object is a State inform registered fetchers that math the path
    if (msg.params.value){
      return Promise.all(this.fetcher.map( async (fetchRule) => {
        if (fetchRule.matches(msg.params.path)) {
          const sub = new Subscription(fetchRule.owner, fetchRule.id);
          this.routes[msg.params.path].addSubscription(sub);
        }
        return this.routes[msg.params.path].publish(msg)
      })).then(()=>Promise.resolve({}));
    }else{
      //If added object is a Method nothing needs to be done
      return Promise.resolve({})
    }
    
  };
  handleChange = (msg: UpdateRequest) => {
    this.routes[msg.params.path].value=msg.params.value
    return this.routes[msg.params.path].publish(msg);
  };
  handleFetch = (msg: FetchRequest, peer: JsonRPC): Promise<object> => {
    const matcher = createPathMatcher(msg.params);
    this.fetcher.push(new FetchRule(msg, peer));
    return Promise.all<object>(
      Object.keys(this.routes).filter((route)=>matcher(route)).map( async (route: string) => {
          const sub = new Subscription(peer, msg.params.id);
          this.routes[route].addSubscription(sub);
          return peer.publish(msg.params.id,{method:"add",value:this.routes[route].value,path:route})
      })
    ).then(()=>Promise.resolve({}))
  };
  handleGet = (msg: GetRequest): Promise<object> => {
    const matcher = createPathMatcher(msg.params);
    return Promise.all<object>(
      Object.keys(this.routes).filter((route)=>matcher(route)).map( async (route: string) => {
          return {"path": route, "value": this.routes[route].value}
      })
    )
  };
  handleUnfetch = (msg: UnFetchRequest) => {
    this.fetcher = this.fetcher.filter((fetch)=>fetch.id !== msg.params.id)
    Object.values(this.routes).forEach((route)=>route.removeFetcher(msg.params.id))
    return Promise.resolve({})
  };
  handleRemove = (route: string) => {
    this.deleteRoute(route)
    return Promise.resolve({})
  };
}
