"use strict";

import {
  invalidRequest,
  isDefined,
  methodNotFound,
  parseError,
} from "../utils";
import { PeerType } from "./peers";
import { Router } from "./router";

export class JsonRPC {
  services: Record<any, any>;
  router: Router;
  constructor(services: Record<any, any>, router: Router) {
    this.services = services;
    this.router = router;
  }
  dispatchMessage = (
    peer: {
      sendMessage: (arg0: any) => void;
    },
    message: any
  ) => {
    let service;
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

  dispatch = (peer: PeerType, message: any) => {
    try {
      message = JSON.parse(message) as any;
    } catch (e) {
      peer.sendMessage({
        error: parseError(e),
      });
      throw e;
    }
    if (Array.isArray(message)) {
      message.forEach((msg) => {
        this.dispatchMessage(peer, msg);
      });
    } else {
      this.dispatchMessage(peer, message);
    }
  };
}
