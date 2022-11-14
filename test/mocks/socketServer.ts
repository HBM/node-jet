import * as wsserver from "../../src/1_socket/wsserver";
import * as tcpserver from "../../src/1_socket/tcpserver";
import { MethodRequest } from "../../src/3_jet/messages";
import { EventType } from "../../src/3_jet/types";
import { Peer } from "../../src/jet";
import { Server as HTTPServer } from "http";

export const WebsocketServer = (): wsserver.WebsocketServer & {
  simulateConnection: (peer: Peer) => void;
  simulateDisconnect: (peer: any) => void;
  simulateMessage: (peer: any, method: EventType, msg: MethodRequest) => any;
} => {
  let cbs: Function[] = [];
  const mock = {
    ...(jest.createMockFromModule(
      "../../src/1_socket/wsserver"
    ) as wsserver.WebsocketServer),
    listen: () => {},
    callbacks: {},
    simulateConnection: (_peer: any) => {},
    simulateDisconnect: (_peer: any) => {},
    simulateMessage: (
      _peer: any,
      _method: EventType,
      _msg: MethodRequest
    ) => {},
    close: () => {},
  };

  mock.addListener = (evt: string, cb: Function) => {
    if (!(evt in mock.callbacks)) mock.callbacks[evt] = [];
    mock.callbacks[evt].push(cb);
    return mock;
  };
  mock.simulateConnection = (peer) => {
    mock.callbacks["connection"].forEach((cb) => cb(peer));
    jest.spyOn(peer, "respond").mockImplementation((id, message, success) => {
      cbs.forEach((cb) => cb({ id: id, message: message, success: success }));
    });
  };

  mock.simulateMessage = (peer, method: EventType, msg: MethodRequest) => {
    peer.callbacks["message"].forEach((cb) => cb(method, msg));
    return new Promise((resolve) => {
      const check = ({ id, message, success }) => {
        if (id === msg.id) {
          cbs = cbs.filter((cb) => cb !== check);
          resolve({ id: id, message: message, success: success });
        }
      };
      cbs.push(check);
    });
  };

  mock.simulateDisconnect = (peer: any) => {
    mock.callbacks["disconnect"].forEach((cb) => cb(peer));
  };
  return mock;
};
export const HTTPServerMock = () =>
  jest.createMockFromModule<HTTPServer>("http");
export const TCPServer = (): server.TCPServer & {
  simulateConnection: (peer: Peer) => void;
  simulateDisconnect: (peer: any) => void;
  simulateMessage: (peer: any, method: EventType, msg: MethodRequest) => any;
} => {
  let cbs: Function[] = [];
  const mock = {
    ...(jest.createMockFromModule(
      "../../src/1_socket/tcpserver"
    ) as tcpserver.TCPServer),
    listen: () => {},
    callbacks: {},
    simulateConnection: (_peer: any) => {},
    simulateDisconnect: (_peer: any) => {},
    simulateMessage: (
      _peer: any,
      _method: EventType,
      _msg: MethodRequest
    ) => {},
    close: () => {},
  };

  mock.addListener = (evt: string, cb: Function) => {
    if (!(evt in mock.callbacks)) mock.callbacks[evt] = [];
    mock.callbacks[evt].push(cb);
    return mock;
  };
  mock.simulateConnection = (peer) => {
    mock.callbacks["connection"].forEach((cb) => cb(peer));
    jest.spyOn(peer, "respond").mockImplementation((id, message, success) => {
      cbs.forEach((cb) => cb({ id: id, message: message, success: success }));
    });
  };

  mock.simulateMessage = (peer, method: EventType, msg: MethodRequest) => {
    peer.callbacks["message"].forEach((cb) => cb(method, msg));
    return new Promise((resolve) => {
      const check = ({ id, message, success }) => {
        if (id === msg.id) {
          cbs = cbs.filter((cb) => cb !== check);
          resolve({ id: id, message: message, success: success });
        }
      };
      cbs.push(check);
    });
  };

  mock.simulateDisconnect = (peer: any) => {
    mock.callbacks["disconnect"].forEach((cb) => cb(peer));
  };
  return mock;
};