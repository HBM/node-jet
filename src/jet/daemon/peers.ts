// @ts-nocheck
import { eachKeyValue } from "../utils";
import { v4 as uuidv4 } from "uuid";
import { hasAccess, isFetchOnly } from "./access";
import EventEmitter from "events";
import * as net from "net";
import { JsonRPC } from "./jsonrpc";
import { jetElements } from "../element";

const genPeerId = (sock): string => {
  if (sock instanceof net.Socket) {
    return sock.remoteAddress + ":" + sock.remotePort;
  } else {
    // this is a websocket
    try {
      sock = sock._sender._socket;
      return `${sock.remoteAddress}:${sock.remotePort}`;
    } catch (e) {
      return uuidv4();
    }
  }
};
export class PeerType extends EventEmitter.EventEmitter {
  id = "";
  fetchers: any[] = [];
  eachFetcher = (_: string) => {};
  removeFetcher = (_: string) => {};
  hasFetchers = () => {};
  sendMessage = (_msg: any) => {};
  addFetcher = (_id: number, _fetcher: any) => {};
}
export class Peers {
  instances: Array<Object> = [];
  jsonrpc: JsonRPC;
  elements: jetElements;
  constructor(jsonrpc: JsonRPC, elements) {
    this.elements = elements;
    this.jsonrpc = jsonrpc;
  }

  remove = (peer) => {
    if (peer && this.instances[peer.id]) {
      peer.eachFetcher((fetchId) => {
        this.elements.removeFetcher(peer.id + fetchId);
      });
      peer.fetchers = {};
      this.elements.removePeer(peer);
      delete this.instances[peer.id];
    }
  };

  eachInstance = eachKeyValue(this.instances);

  eachPeerFetcherWithAccessIterator = (element, f) => {
    this.eachInstance((peerId, peer) => {
      if (hasAccess("fetch", peer, element)) {
        peer.eachFetcher((fetchId, fetcher) => {
          f(peerId + fetchId, fetcher, !isFetchOnly(peer, element));
        });
      }
    });
  };

  eachPeerFetcherWithAccess = () => {
    return this.eachPeerFetcherWithAccessIterator;
  };

  add = (sock) => {
    const peer = new PeerType();
    const peerId = genPeerId(sock);

    peer.sendMessage = (message) => {
      console.log("Now sending for real", message);
      message = JSON.stringify(message);
      sock.send(message);
    };

    sock.on("message", (message) => {
      try {
        this.jsonrpc.dispatch(peer, message);
      } catch (e) {
        this.remove(peer);
      }
    });

    peer.id = peerId;
    peer.fetchers = [];
    peer.eachFetcher = eachKeyValue(peer.fetchers);
    peer.addFetcher = (id, fetcher) => {
      peer.fetchers[id] = fetcher;
    };
    peer.removeFetcher = (id) => {
      delete peer.fetchers[id];
    };
    peer.hasFetchers = () => {
      return Object.keys(peer.fetchers).length !== 0;
    };
    this.instances[peerId] = peer;
    sock.once("close", () => {
      peer.emit("disconnect");
      this.remove(peer);
    });

    sock.once("error", (err) => {
      console.log("sock err", err);
      console.log("removing peer");
      this.remove(peer);
    });
    return peer;
  };
}
