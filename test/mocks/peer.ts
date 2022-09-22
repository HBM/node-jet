import * as JsonRPC from "../../src/2_jsonrpc";
import * as server from "../../src/2_jsonrpc/server";
import { Logger } from "../../src/3_jet/log";

export const fullFetcherPeer = (): any => {
  const peer = {
    ...(jest.createMockFromModule("../../src/2_jsonrpc") as JsonRPC.JsonRPC),
    connect: () => Promise.resolve(),
    callbacks: {},
    close: jest.fn(),
    _isOpen: true,
    respond: jest.fn(),
    send: jest.fn(),
    queue: jest.fn(),
    sendRequest: jest
      .fn()
      .mockImplementation((method) =>
        method === "info"
          ? Promise.resolve({ features: { fetch: "full" } })
          : Promise.resolve([])
      ),
  };
  peer.addListener = (evt: string, cb: Function) => {
    if (!(evt in peer.callbacks)) peer.callbacks[evt] = [];
    peer.callbacks[evt].push(cb);
    return peer;
  };
  return peer;
};

export const simpleFecherPeer = (): any => {
  const peer = {
    ...(jest.createMockFromModule("../../src/2_jsonrpc") as JsonRPC.JsonRPC),
    connect: () => Promise.resolve(),
    callbacks: {},
    _isOpen: true,
    respond: jest.fn(),
    send: jest.fn(),
    queue: jest.fn(),
    sendRequest: jest
      .fn()
      .mockImplementation((method) =>
        method === "info"
          ? Promise.resolve({ features: { fetch: "simple" } })
          : Promise.resolve([])
      ),
  };
  peer.addListener = (evt: string, cb: Function) => {
    if (!(evt in peer.callbacks)) peer.callbacks[evt] = [];
    peer.callbacks[evt].push(cb);
    return peer;
  };
  return peer;
};
