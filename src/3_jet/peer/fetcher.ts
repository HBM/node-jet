import EventEmitter from "events";
import { FetchRequest } from "../messages";
import { PathRule, sortable } from "../types";
// import * as crypto from "crypto";

interface ValueRule {
  key: string;
  value: string;
}
export class Fetcher extends EventEmitter.EventEmitter {
  message: FetchRequest = { id: "",method: "fetch", params: { path: {}, sort: {},id:"" } };
  valueRules: ValueRule[] = [];
  rule = {
    path: this.message.params.path,
    value: this.valueRules
  }
  constructor() {
    super();
    this.message = {
      id: "", //crypto.randomUUID(),
      method: "fetch",
      params: { path: {}, sort: {},id:"" },
    };
  }
  path = (key: PathRule, value: string) => {
    this.message.params.path[key as string] = value;
    this.rule.path = this.message.params.path
    return this;
  };

  differential = () => {
    this.message.params.sort.asArray = false;
    return this;
  };

  ascending = () => {
    this.message.params.sort.descending = false;
    return this;
  };

  descending = () => {
    this.message.params.sort.descending = true;
    return this;
  };
  sortByKey = (key: string, type: sortable) => {
    if (!this.message.params.sort.byValueField)
      this.message.params.sort.byValueField = {};
    this.message.params.sort.byValueField[key] = type;
    return this;
  };
  sortByValue = (accept: boolean) => {
    this.message.params.sort.byValue = accept;
    return this;
  };
  sortByPath = (accept: boolean) => {
    this.message.params.sort.byPath = accept;
    return this;
  };

  range = (_from: number, _to: number) => {
    this.message.params.sort.from = _from;
    this.message.params.sort.to = _to;
    return this;
  };
  
}

export default Fetcher;
