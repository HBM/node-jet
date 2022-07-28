"use strict";

import JsonRPC from "../../2_jsonrpc";
import { publishEvent } from "../peer";
import { ValueType } from "../types";
import { Subscriber } from "./subscriber";

export class Route {
  owner: JsonRPC;
  subscriptions: Subscriber[] = [];
  value?: ValueType;
  path: string;
  constructor(
    owner: JsonRPC,
    path: string,
    value: ValueType | undefined = undefined
  ) {
    this.owner = owner;
    this.value = value;
    this.path = path;
  }

  addSubscriber = (sub: Subscriber) => {
    this.subscriptions.push(sub);
    sub.enqueue({
      event: "Add",
      path: this.path,
      value: this.value,
    });
  };

  removeSubscriber = (fetchId: string) => {
    this.subscriptions = this.subscriptions.filter((sub) => sub.id !== fetchId);
  };

  updateValue = (newValue: ValueType) => {
    if (newValue === this.value) return;
    this.value = newValue;
    this.publish("Change");
  };
  publish = (event: publishEvent) => {
    this.subscriptions.forEach((sub) => {
      if (sub.matchesValue(this.value)) {
        sub.enqueue({
          event: event,
          path: this.path,
          value: this.value,
        });
      }
    });
  };
}
