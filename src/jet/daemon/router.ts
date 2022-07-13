"use strict";

import assert from "assert";
import { jetElement } from "../element";
import { responseTimeout } from "../errors";
import { BasicPeer } from "../peer";
import { optional } from "../utils";
import { Message } from "./access";

export class Router {
  log: Function;
  rcount: number;
  routes: Record<string, any>;
  constructor(log: Function) {
    this.log = log;
    // holds info about all pending requests (which are routed)
    // key is (daemon generated) unique id, value is Object
    // with original request id and receiver (peer) and request
    // timer
    this.routes = {};

    // counter to make the routed request more unique.
    // addresses situation if a peer makes two requests with
    // same message.id.
    this.rcount = 0;
  }
  request = (message: Message, peer: BasicPeer, element: jetElement) => {
    const timeout =
      optional<number>(message.params, "timeout", "number") ||
      element.timeout ||
      5;
    /* jslint bitwise: true */
    this.rcount = (this.rcount + 1) % 2 ^ 31;
    const id = message.id.toString() + peer._id + this.rcount;
    assert.equal(this.routes[id], null); // eslint-disable-line
    this.routes[id] = {
      receiver: peer,
      id: message.id,
      timer: setTimeout(() => {
        delete this.routes[id];
        peer.sendMessage({
          id: message.id,
          error: responseTimeout(message.params),
        });
      }, timeout * 1000),
    };

    return id;
  };
  // routes an incoming response to the requestor (peer)
  // which made the request.
  // stops timeout timer eventually.
  response = (_: BasicPeer, message: Message) => {
    const route = this.routes[message.id];
    if (route) {
      clearTimeout(route.timer);
      delete this.routes[message.id];
      message.id = route.id;
      route.receiver.sendMessage(message);
    } else {
      this.log("cannot route message (timeout?)", message);
    }
  };
}