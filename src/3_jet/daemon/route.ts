"use strict";
import { EventEmitter } from "events";
import JsonRPC from "../../2_jsonrpc";
import { ValueType } from "../types";

export class Route extends EventEmitter {
  owner: JsonRPC;
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
    this.emit("Change", this.path, newValue);
  };
  remove = () => this.emit("Remove", this.path);
}
