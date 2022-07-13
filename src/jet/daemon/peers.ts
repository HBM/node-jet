import { eachKeyValue } from "../utils";
import { hasAccess, isFetchOnly, Message } from "./access";
import EventEmitter from "events";
import { jetElement, jetElements } from "../element";
import MessageSocket from "../message-socket";
import { FetcherFunction } from "../fetcher";
import { Fetcher } from "../peer/fetch";
import { BasicPeer } from "../peer";

export type MessageFunction = (_msg: Message) => void;
export class PeerType extends EventEmitter.EventEmitter {
  id = "";
  fetchers: Record<string, FetcherFunction> = {};
  eachFetcher: any = (_: string) => {};
  fetchingSimple: boolean = false;
  removeFetcher = (_: string) => {};
  hasFetchers = () => false;
  sendMessage: MessageFunction = (_msg: Message) => {};
  addFetcher = (_id: string, _fetcher: FetcherFunction) => {};
  auth: any;
  name: string = "";
}
export class Peers {
  instances: Record<string, BasicPeer> = {};
  elements: jetElements;
  constructor(elements: jetElements) {
    this.elements = elements;
  }

  remove = (peer: BasicPeer) => {
    if (peer && this.instances[peer._id]) {
      peer.eachFetcher((fetchId: string) => {
        this.elements.removeFetcher(peer._id + fetchId);
      });
      peer.fetchers = {};
      this.elements.removePeer(peer);
      delete this.instances[peer._id];
    }
  };

  eachInstance = eachKeyValue(this.instances);

  eachPeerFetcherWithAccessIterator = (element: jetElement, f: any) => {
    this.eachInstance((peerId, peer) => {
      if (hasAccess("fetch", peer, element)) {
        peer.eachFetcher((fetchId: string, fetcher: Fetcher) => {
          f(peerId + fetchId, fetcher, !isFetchOnly(peer, element));
        });
      }
    });
  };

  eachPeerFetcherWithAccess = () => {
    return this.eachPeerFetcherWithAccessIterator;
  };

  add = (sock: MessageSocket) => {
    const peer = new BasicPeer(sock);
    sock.on("message", (message: string) => {
      try {
        peer.emit("message", message);
      } catch (e) {
        this.remove(peer);
      }
    });
    sock.once("close", () => {
      peer.emit("disconnect");
      this.remove(peer);
    });

    sock.once("error", (err: string) => {
      console.log("sock err", err);
      console.log("removing peer");
      this.remove(peer);
    });
    this.instances[peer._id] = peer;

    return peer;
  };
}
