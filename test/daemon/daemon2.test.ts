import { Peer } from "../../src/3_jet/peer";
import * as Server from "../../src/2_jsonrpc/server";
import Method from "../../src/3_jet/peer/method";
import State from "../../src/3_jet/peer/state";
import { ValueType } from "../../src/3_jet/types";
import waitForExpect from "wait-for-expect";
import { Daemon, Fetcher } from "../../src/jet";
import { jsonRPCServer } from "../mocks/jsonrpc";
import { AddRequest, MethodRequest } from "../../src/3_jet/messages";
import { simpleFecherPeer } from "../mocks/peer";
import { AddState } from "../mocks/messages";
describe("Testing Daemon 2 (Notifications)", () => {
  it("Should test daemon functionality", (done) => {
    const mockServer = jsonRPCServer();
    jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
    const daemon = new Daemon({
      features: {
        batches: true,
        asNotification: true,
        authentication: true,
        fetch: "full",
      },
    });
    daemon.listen({});

    const peer = simpleFecherPeer();
    mockServer.simulateConnection(peer);
    mockServer
      .simulateMessage(peer, "info", {
        id: "2",
        method: "info",
      } as MethodRequest)
      .then((res) => {
        expect(res.message).toEqual({
          features: {
            authentication: true,
            asNotification: true,
            batches: true,
            fetch: "full",
          },
          name: "node-jet",
          protocolVersion: "1.1.0",
          version: "2.2.0",
        });
        expect(res.success).toEqual(true);
      })
      .then(() =>
        mockServer.simulateMessage(peer, "configure", {
          id: "2",
          method: "configure",
        } as MethodRequest)
      )
      .then((res) => {
        expect(res.message).toEqual({});
        expect(res.success).toEqual(true);
      })
      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done());
  });

  it("Should test get & fetch functionality", (done) => {
    const mockServer = jsonRPCServer();
    jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
    const peer = simpleFecherPeer();
    peer.publish = jest.fn();
    jest.spyOn(peer, "publish").mockImplementation((id, msg: any) => {
      expect(id).toEqual("__f__1");
      expect(msg.method).toEqual("add");
      expect(["bar", "bar2", "bar4"]).toContainEqual(msg.path);
      return Promise.resolve();
    });

    const daemon = new Daemon({
      features: {
        batches: true,
        asNotification: true,
        authentication: true,
        fetch: "full",
      },
    });
    daemon.listen({});
    mockServer.simulateConnection(peer);

    //Adding state
    mockServer
      .simulateMessage(peer, "add", {
        id: "1",
        method: "add",
        params: { path: "bar", value: 2 },
      } as MethodRequest)
      .then(() => mockServer.simulateMessage(peer, "add", AddState("bar2", 3)))
      .then(() => mockServer.simulateMessage(peer, "add", AddState("bar4", 5)))
      .then(() =>
        mockServer.simulateMessage(peer, "change", {
          id: "4",
          method: "change",
          params: { path: "bar", value: 1 },
        } as MethodRequest)
      )
      .then(() =>
        mockServer.simulateMessage(peer, "change", {
          id: "5",
          method: "change",
          params: { path: "bar4", value: 6 },
        } as MethodRequest)
      )
      .then(() =>
        mockServer.simulateMessage(peer, "fetch", {
          id: "6",
          method: "fetch",
          params: { path: { startswith: "bar" }, id: "__f__1" },
        } as MethodRequest)
      )
      .then((res) => {
        //important that the ack event is called before add
        expect(peer.publish).toBeCalledTimes(0);
        expect(res.message).toEqual({});
        expect(res.success).toEqual(true);
      })
      .then(() => waitForExpect(() => expect(peer.publish).toBeCalledTimes(3)))
      .then(() =>
        mockServer.simulateMessage(peer, "get", {
          id: "7",
          method: "get",
          params: { path: { startswith: "bar" } },
        } as MethodRequest)
      )
      .then((res) => {
        expect(res.message).toEqual([
          { path: "bar", value: 1 },
          { path: "bar2", value: 3 },
          { path: "bar4", value: 6 },
        ]);
        expect(res.success).toEqual(true);
      })
      .then(() => done());
  });

  it("Should test change functionality", (done) => {
    const mockServer = jsonRPCServer();
    jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
    const daemon = new Daemon({
      features: {
        batches: true,
        asNotification: true,
        authentication: true,
        fetch: "full",
      },
    });
    daemon.listen({});
    const fetchId = "__f__1";
    const newValue = 6;
    const peer = simpleFecherPeer();
    mockServer.simulateConnection(peer);
    peer.publish = jest.fn();
    jest.spyOn(peer, "publish").mockImplementation((id, msg: any) => {
      expect(id).toEqual(fetchId);
      expect(["change", "remove"]).toContain(msg.method);
      expect(msg.path).toEqual("bar");
      expect(msg.value).toEqual(newValue);
      return Promise.resolve();
    });

    jest.spyOn(peer, "send").mockImplementation((method, msg: any) => {
      return method === "get"
        ? Promise.resolve({ path: msg.path, value: 3 })
        : Promise.reject("method was not get");
    });
    //Adding state
    mockServer
      .simulateMessage(peer, "add", {
        id: "1",
        method: "add",
        params: { path: "bar", value: 2 },
      } as MethodRequest)
      .then(() =>
        mockServer.simulateMessage(peer, "fetch", {
          id: "2",
          method: "fetch",
          params: { path: { startswith: "bar" }, id: fetchId },
        } as MethodRequest)
      )
      .then(() =>
        mockServer.simulateMessage(peer, "change", {
          id: "3",
          method: "change",
          params: { path: "bar", value: newValue },
        } as MethodRequest)
      )

      .then(() => mockServer.simulateDisconnect(peer))
      .then(() => done());
  });
});
