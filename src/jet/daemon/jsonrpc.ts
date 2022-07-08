// @ts-nocheck
"use strict";

import {
  invalidRequest,
  isDefined,
  methodNotFound,
  parseError,
} from "../utils";
import { Message } from "./access";
import { PeerType } from "./peers";
import { Router } from "./router";

export class JsonRPC {
  services: Record<string, Function>;
  router: Router;
  constructor(services: Record<string, Function>, router: Router) {
    this.services = services;
    this.router = router;
  }
  dispatchMessage = (peer: PeerType, message: Message) => {
    let service = this.services[message.method];

    if (message.method) {
      service = this.services[message.method];
      if (service) {
        service(peer, message);
      } else if (isDefined(message.id)) {
        peer.sendMessage({
          id: message.id,
          error: methodNotFound(message.method),
        });
      }
    } else if (
      typeof message.result !== "undefined" ||
      typeof message.error !== "undefined"
    ) {
      this.router.response(peer, message);
    } else if (isDefined(message.id)) {
      const error = invalidRequest(message);
      peer.sendMessage({
        id: message.id,
        error: error,
      });
    }
  };

  dispatch = (peer: PeerType, message: string) => {
    try {
      const decoded = JSON.parse(message) as Message | Message[];
      if (Array.isArray(decoded)) {
        decoded.forEach((msg: Message) => {
          this.dispatchMessage(peer, msg);
        });
      } else {
        this.dispatchMessage(peer, decoded);
      }
    } catch (e) {
      peer.sendMessage({
        id: "",
        error: parseError(e),
      });
      throw e;
    }
  };
}
