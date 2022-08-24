import EventEmitter from "events";
import { Subscription } from "../daemon/subscription";
import { FetchOptions } from "../messages";
import { PathRule, ValueType, ValueRule as Operator } from "../types";

export interface ValueRule {
  operator: "greaterThan" | "lessThan" | "equals";
  value: string | number | boolean;
}
export class Fetcher extends EventEmitter.EventEmitter {
  message: FetchOptions = { path: {}, value: {}, sort: {}, id: "" };
  valueRules: Record<string, ValueRule> = {};

  constructor() {
    super();
  }
  path = (key: PathRule, value: string) => {
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
    console.log(
      path,
      this.message,
      sub.matchesPath(path),
      sub.matchesValue(value)
    );
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
