"use strict";
import EventEmitter from "events";
import JsonRPC from "../../2_jsonrpc";
import { ValueType } from "../types";
import { Subscription } from "./subscription";

export class Route extends EventEmitter.EventEmitter {
  owner: JsonRPC;
  subscriptions: Subscription[] = [];
  value?: ValueType;
  path: string;
  constructor(
    owner: JsonRPC,
    path: string,
    value: ValueType | undefined = undefined
  ) {
    super();
    this.owner = owner;
    this.value = value;
    this.path = path;
  }

  updateValue = (newValue: ValueType) => {
    if (newValue === this.value) return;
    this.value = newValue;
    this.emit("Change", newValue);
  };
  remove = () => this.emit("Remove");
}
