"use strict";

import JsonRPC from "../../2_jsonrpc";
import { FetchRequest } from "../messages";
import { PublishParams } from "../peer";
import { ValueType } from "../types";
import { createPathMatcher } from "./path_matcher";
import { create as createValueMatcher } from "./value_matcher";

export class Subscriber {
  owner?: JsonRPC;
  id: string;
  requests: PublishParams[] = [];
  pathMatcher: (path: string) => boolean;
  valueMatcher: (value: ValueType | undefined) => boolean;
  constructor(msg: FetchRequest, peer: JsonRPC | undefined = undefined) {
    this.pathMatcher = createPathMatcher(msg.params);
    this.valueMatcher = createValueMatcher(msg.params);
    this.owner = peer;
    this.id = msg.params.id;
  }
  matchesPath = (path: string) => this.pathMatcher(path);
  matchesValue = (value: ValueType | undefined) => this.valueMatcher(value);

  enqueue = (msg: PublishParams) => {
    this.requests.push(msg);
  };

  flush = () => {
    this.requests.forEach((req) => this.owner?.publish(this.id, req));
    this.requests = [];
  };
}
