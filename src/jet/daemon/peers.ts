// @ts-nocheck
import { eachKeyValue } from "../utils";
import { v4 as uuidv4 } from "uuid";
import { hasAccess, isFetchOnly, Message } from "./access";
import EventEmitter from "events";
import * as net from "net";
import { JsonRPC } from "./jsonrpc";
import { jetElement, jetElements } from "../element";
import MessageSocket from "../message-socket";
import { FetcherFunction } from "../fetcher";

const genPeerId = (sock: any): string => {
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
export type MessageFunction = (_msg: Message) => void;
export class PeerType extends EventEmitter.EventEmitter {
  id = "";
  fetchers: Record<string, FetcherFunction> = {};
  eachFetcher: any = (_: string) => {};
  fetchingSimple: boolean = false;
  removeFetcher = (_: string) => {};
  hasFetchers = () => {};
  sendMessage: MessageFunction = (_msg: Message) => {};
  addFetcher = (_id: string, _fetcher: FetcherFunction) => {};
  auth: any;
  name: string = "";
}
export class Peers {
  instances: any = [];
  jsonrpc: JsonRPC;
  elements: jetElements;
  constructor(jsonrpc: JsonRPC, elements: jetElements) {
    this.elements = elements;
    this.jsonrpc = jsonrpc;
  }

  remove = (peer: PeerType) => {
    if (peer && this.instances[peer.id]) {
      peer.eachFetcher((fetchId: string) => {
        this.elements.removeFetcher(peer.id + fetchId);
      });
      peer.fetchers = {};
      this.elements.removePeer(peer);
      delete this.instances[peer.id];
    }
  };

  eachInstance = eachKeyValue(this.instances);

  eachPeerFetcherWithAccessIterator = (
    element: jetElement,
    f: (arg0: string, arg1: any, arg2: boolean) => void
  ) => {
    this.eachInstance((peerId, peer) => {
      if (hasAccess("fetch", peer, element)) {
        peer.eachFetcher((fetchId: string, fetcher: any) => {
          f(peerId + fetchId, fetcher, !isFetchOnly(peer, element));
        });
      }
    });
  };

  eachPeerFetcherWithAccess = () => {
    return this.eachPeerFetcherWithAccessIterator;
  };

  add = (sock: MessageSocket) => {
    const peer = new PeerType();
    const peerId = genPeerId(sock);

    peer.sendMessage = (message) => {
      sock.send(JSON.stringify(message));
    };

    sock.on("message", (message: string) => {
      try {
        this.jsonrpc.dispatch(peer, message);
      } catch (e) {
        this.remove(peer);
      }
    });

    peer.id = peerId;
    peer.fetchers = {};
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

    sock.once("error", (err: any) => {
      console.log("sock err", err);
      console.log("removing peer");
      this.remove(peer);
    });
    return peer;
  };
}
