import * as Sock from "../../src/1_socket/server";
import { Logger, LogLevel } from "../../src/3_jet/log";
import {
  HTTPServerMock,
  TCPServer,
  WebsocketServer,
} from "../mocks/socketServer";
import { JsonRPCServer } from "../../src/2_jsonrpc/server";
import { sockMock } from "../mocks/sock";

describe("Testing JsonRpc", () => {
  it("Should test wsServer functionality", () => {
    const wsServer = WebsocketServer();
    jest.spyOn(Sock, "WebsocketServer").mockImplementation(() => wsServer);
    const server = new JsonRPCServer(new Logger(), { wsPort: 11235 });
    server.listen();
    const sock = sockMock();
    wsServer.simulateConnection(sock);
    wsServer.simulateDisconnect(sock);
    server.close();
  });
  it("Should test wsServer external", () => {
    const wsServer = WebsocketServer();
    jest.spyOn(Sock, "WebsocketServer").mockImplementation(() => wsServer);
    const server = new JsonRPCServer(new Logger(), {
      server: HTTPServerMock(),
    });
    server.listen();
    const sock = sockMock();
    wsServer.simulateConnection(sock);
    wsServer.simulateDisconnect(sock);
    server.close();
  });
  it("Should test tcpServer functionality", () => {
    const tcpServer = TCPServer();
    jest.spyOn(Sock, "TCPServer").mockImplementation(() => tcpServer);
    const server = new JsonRPCServer(new Logger(), { tcpPort: 11234 });
    server.listen();
    const sock = sockMock();
    tcpServer.simulateConnection(sock);
    tcpServer.simulateDisconnect(sock);
    server.close();
  });
});
