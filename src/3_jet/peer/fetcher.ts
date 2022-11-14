import { EventEmitter } from "../../1_socket";
import { Subscription } from "../daemon/subscription";
import { FetchOptions } from "../messages";
import {
  PathRule,
  ValueType,
  OperatorType as Operator,
  ValueRule,
  pathFunction,
} from "../types";

export class Fetcher extends EventEmitter {
  message: FetchOptions = { path: {}, value: {}, sort: {}, id: "" };
  valueRules: Record<string, ValueRule> = {};

  constructor() {
    super();
    this.setMaxListeners(0);
  }

  path: pathFunction = (key: PathRule, value: string | string[]) => {
    this.message.path[key as string] = value;
    return this;
  };
  value = (
    operator: Operator,
    value: string | boolean | number,
    field: string = ""
  ) => {
    this.message.value[field] = {
      operator,
      value,
    };
    return this;
  };
  matches = (path: string, value: ValueType | undefined): boolean => {
    const sub = new Subscription(this.message);
    return sub.matchesPath(path) && sub.matchesValue(value);
  };

  differential = () => {
    this.message.sort.asArray = false;
    return this;
  };

  ascending = () => {
    this.message.sort.descending = false;
    return this;
  };

  descending = () => {
    this.message.sort.descending = true;
    return this;
  };

  sortByValue = (key: string = "") => {
    this.message.sort.by = key ? `value.${key}` : "value";
    return this;
  };
  sortByPath = () => {
    this.message.sort.by = "path";
    return this;
  };

  range = (_from: number, _to: number) => {
    this.message.sort.from = _from;
    this.message.sort.to = _to;
    return this;
  };
}

export default Fetcher;
