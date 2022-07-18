"use strict";
import EventEmitter from "events";
import { Message } from "./messages";
export type EventType =
  | "configure"
  | "info"
  | "fetch"
  | "remove"
  | "change"
  | "add"
  | "data"
  | "call"
  | "get"
  | "set";
export type sortable = "boolean" | "number" | "string";
export interface AccessType {
  id?: string;
}
export type ValueType = string | number | object | boolean;

export type MessageFunction = (_msg: Message) => void;
export class PeerType extends EventEmitter.EventEmitter {
  id = "";
  fetchers: Record<string, any> = {};
  eachFetcher: any = (_: string) => {};
  fetchingSimple: boolean = false;
  removeFetcher = (_: string) => {};
  hasFetchers = () => false;
  sendMessage: MessageFunction = (_msg: Message) => {};
  addFetcher = (_id: string, _fetcher: any) => {};
  auth: any;
  name: string = "";
}
