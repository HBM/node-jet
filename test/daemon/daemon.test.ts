import * as Server from "../../src/2_jsonrpc/server";
import { Daemon, Fetcher, NotFound, Occupied } from "../../src/jet";
import { jsonRPCServer } from "../mocks/jsonrpc";
import { MethodRequest } from "../../src/3_jet/messages";
import {
  AddMethod,
  AddResolve,
  AddState,
  CallRequest,
  CallResolve,
  changeState,
  RemoveRequest,
  RemoveResolve,
  SetRequest,
  SetResolve,
} from "../mocks/messages";
import { simpleFecherPeer } from "../mocks/peer";
describe("Testing Peer", () => {
  describe("Should construct daemon", () => {
    it("Should test daemon functionality", (done) => {
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon();
      daemon.listen();
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
              asNotification: false,
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
        .then(() => daemon.close())
        .then(() => done());
    });

    it("Should test add functionality", (done) => {
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon();
      daemon.listen({});
      const peer = simpleFecherPeer();
      mockServer.simulateConnection(peer);
      mockServer
        .simulateMessage(peer, "add", AddState("bar", 1))
        .then((res) => {
          expect(res).toEqual(AddResolve());
        })
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddState("bar2", 1))
        )
        .then((res) => {
          expect(res).toEqual(AddResolve());
        })
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddMethod("method"))
        )
        .then((res) => {
          expect(res).toEqual(AddResolve());
        })
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddMethod("method"))
        )
        .then((res) => {
          expect(res.message).toEqual(new Occupied());
          expect(res.success).toEqual(false);
        })
        .then(() => mockServer.simulateDisconnect(peer))
        .then(() => done());
    });
    it("Should test remove functionality", (done) => {
      const peer = simpleFecherPeer();
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon();
      daemon.listen({});
      mockServer.simulateConnection(peer);
      mockServer
        .simulateMessage(peer, "remove", RemoveRequest("bar"))
        .then((res) => {
          expect(res.success).toEqual(false);
          expect(res.message).toEqual(new NotFound());
        })
        .then(() => mockServer.simulateMessage(peer, "add", AddState("bar", 1)))
        .then((res) => {
          expect(res).toEqual(AddResolve());
        })
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddMethod("method"))
        )
        .then((res) => {
          expect(res).toEqual(AddResolve());
        })
        .then(() =>
          mockServer.simulateMessage(peer, "remove", RemoveRequest("bar"))
        )
        .then((res) => {
          expect(res).toEqual(RemoveResolve());
        })
        .then(() =>
          mockServer.simulateMessage(peer, "remove", RemoveRequest("method"))
        )
        .then((res) => {
          expect(res).toEqual(RemoveResolve());
        })
        .then(() => mockServer.simulateDisconnect(peer))
        .then(() => done());
    });

    it("Should test set functionality", (done) => {
      const peer = simpleFecherPeer();
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon();
      daemon.listen({});
      mockServer.simulateConnection(peer) as any;

      jest.spyOn(peer, "send").mockImplementation((method, msg: any) => {
        return method === "set"
          ? Promise.resolve(msg)
          : Promise.reject("method was not set");
      });
      //Adding state
      mockServer
        .simulateMessage(peer, "add", AddState("bar", 2))
        .then((res) => {
          expect(res).toEqual(AddResolve());
        })
        //Adding method
        .then(() =>
          mockServer.simulateMessage(peer, "set", SetRequest("bar", 6))
        )
        .then((res) => {
          expect(res).toEqual(SetResolve("bar", 6));
        })
        //Should fail to add method
        .then(() =>
          mockServer.simulateMessage(peer, "set", SetRequest("bar", true))
        )
        .then((res) => {
          expect(res).toEqual(SetResolve("bar", true));
        })
        .then(() =>
          mockServer.simulateMessage(peer, "set", SetRequest("bar", {}))
        )
        .then((res) => {
          expect(res).toEqual(SetResolve("bar", {}));
        })
        .then(() => mockServer.simulateDisconnect(peer))
        .then(() => done());
    });
    it("Should test call functionality", (done) => {
      const peer = simpleFecherPeer();
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon();
      daemon.listen({});
      mockServer.simulateConnection(peer);

      // jest.spyOn(peer, "send").mockImplementation((method, msg: any) => {
      //   return method === "call"
      //     ? Promise.resolve({})
      //     : Promise.reject("method was not call");
      // });
      mockServer
        .simulateMessage(peer, "add", AddMethod("bar"))
        .then((res) => {
          expect(res).toEqual(AddResolve());
        })
        .then(() =>
          mockServer.simulateMessage(peer, "call", CallRequest("bar", [6]))
        )
        .then((res) => {
          expect(res).toEqual(CallResolve());
        })
        .then(() =>
          mockServer.simulateMessage(
            peer,
            "set",
            CallRequest("bar", { arg1: 4, arg2: 5 })
          )
        )
        .then((res) => {
          expect(res).toEqual(CallResolve());
        })
        .then(() => mockServer.simulateDisconnect(peer))
        .then(() => done());
    });

    it("test full fetch", (done) => {
      const peer = simpleFecherPeer();
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon({
        features: {
          fetch: "full",
        },
      });
      daemon.listen({});
      mockServer.simulateConnection(peer);
      peer.publish = jest.fn();
      jest.spyOn(peer, "notify").mockImplementation((id, msg: any) => {
        expect(id).toEqual("__f__1");
        expect(["Add", "Change"]).toContainEqual(msg.event);
        expect(["bar", "bar2", "bar4"]).toContainEqual(msg.path);
        return Promise.resolve();
      });
      //Adding state
      mockServer
        .simulateMessage(peer, "add", AddState("bar", 1))
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddState("bar2", 3))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "fetch", {
            id: "4",
            method: "fetch",
            params: { path: { startswith: "bar" }, id: "__f__1" },
          } as MethodRequest)
        )
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddState("bar4", 1))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "change", changeState("bar4", 6))
        )
        .then((res) => {
          //important that the add event was called before ack
          expect(peer.notify).toBeCalledTimes(4);
          expect(res.message).toEqual({});
          expect(res.success).toEqual(true);
        })
        .then(() => done());
    });

    it("test simple fetch", (done) => {
      const peer = simpleFecherPeer();
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon({
        features: {
          fetch: "simple",
        },
      });
      daemon.listen({});
      mockServer.simulateConnection(peer);
      peer.publish = jest.fn();
      jest.spyOn(peer, "notify").mockImplementation((id, msg: any) => {
        expect(id).toEqual("__f__1");
        expect(["Add", "Change"]).toContainEqual(msg.event);
        expect(["bar", "bar2", "bar4"]).toContainEqual(msg.path);
        return Promise.resolve();
      });
      //Adding state
      mockServer
        .simulateMessage(peer, "add", AddState("bar", 1))
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddState("bar2", 3))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "fetch", {
            id: "4",
            method: "fetch",
            params: { path: { startswith: "bar" }, id: "__f__1" },
          } as MethodRequest)
        )
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddState("bar4", 1))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "change", changeState("bar", 4))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "change", changeState("bar4", 6))
        )
        .then((res) => {
          //important that the add event was called before ack
          expect(peer.notify).toBeCalledTimes(5);
          expect(res.message).toEqual({});
          expect(res.success).toEqual(true);
        })
        .then(() =>
          mockServer.simulateMessage(peer, "fetch", {
            id: "6",
            method: "fetch",
            params: { path: { startswith: "foo" }, id: "__f__2" },
          } as MethodRequest)
        )
        .then(() => done());
    });
    it("Should test get ", (done) => {
      const peer = simpleFecherPeer();
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon({
        features: {
          fetch: "simple",
        },
      });
      daemon.listen({});
      mockServer.simulateConnection(peer);
      peer.publish = jest.fn();
      jest.spyOn(peer, "notify").mockImplementation((id, msg: any) => {
        expect(id).toEqual("__f__1");
        expect(["Add", "Change"]).toContainEqual(msg.event);
        expect(["bar", "bar2", "bar4"]).toContainEqual(msg.path);
        return Promise.resolve();
      });
      //Adding state
      mockServer
        .simulateMessage(peer, "add", AddState("bar", 1))
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddState("bar2", 3))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "change", changeState("bar", 4))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "change", changeState("bar", 4))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "get", {
            id: "5",
            method: "get",
            params: { path: { startswith: "bar" } },
          } as MethodRequest)
        )
        .then((res) => {
          expect(res.message).toEqual([
            { path: "bar", value: 4 },
            { path: "bar2", value: 3 },
          ]);
          expect(res.success).toEqual(true);
        })
        .then(() => done());
    });
    it("Should test unfetch", (done) => {
      const peer = simpleFecherPeer();
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon();
      daemon.listen({});
      mockServer.simulateConnection(peer);
      peer.publish = jest.fn();

      //Adding state
      mockServer
        .simulateMessage(peer, "add", AddState("bar", 2))
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddState("bar2", 3))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "add", AddState("bar4", 5))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "change", changeState("bar", 1))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "change", changeState("bar4", 6))
        )
        .then(() =>
          mockServer.simulateMessage(peer, "fetch", {
            id: "6",
            method: "fetch",
            params: { path: { startswith: "bar" }, id: "__f__1" },
          } as MethodRequest)
        )
        .then(() =>
          mockServer.simulateMessage(peer, "unfetch", {
            id: "7",
            method: "unfetch",
            params: { id: "__f__1" },
          } as MethodRequest)
        )
        .then(() => done());
    });

    it("Should test change functionality", (done) => {
      const peer = simpleFecherPeer();
      const mockServer = jsonRPCServer();
      jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
      const daemon = new Daemon();
      daemon.listen({});
      const fetchId = "__f__1";
      const newValue = 6;
      mockServer.simulateConnection(peer) as any;
      peer.publish = jest.fn();
      jest.spyOn(peer, "publish").mockImplementation((id, msg: any) => {
        expect(id).toEqual(fetchId);
        expect(msg.method).toEqual("change");
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
        .simulateMessage(peer, "add", AddState("bar", 2))
        .then(() =>
          mockServer.simulateMessage(peer, "fetch", {
            id: "2",
            method: "fetch",
            params: { path: { startswith: "bar" }, id: fetchId },
          } as MethodRequest)
        )
        .then(() =>
          mockServer.simulateMessage(
            peer,
            "change",
            changeState("bar", newValue)
          )
        )
        .then(() => done());
    });
    // it("Should test invalid method", (done) => {
    //   const peer = simpleFecherPeer();
    //   const mockServer = jsonRPCServer();
    //   jest.spyOn(Server, "JsonRPCServer").mockImplementation(() => mockServer);
    //   const daemon = new Daemon();
    //   daemon.listen({});
    //   const fetchId = "__f__1";
    //   const newValue = 6;
    //   mockServer.simulateConnection(peer) as any;
    //   mockServer
    //     .simulateMessage(
    //       peer,
    //       "foo" as any,
    //       {
    //         id: "1",
    //         method: "foo",
    //         params: { path: "bar", value: 2 },
    //       } as MethodRequest
    //     )
    //     .then((res) => {
    //       expect(res.message).toEqual("Unknown method");
    //       expect(res.success).toEqual(false);
    //     })
    //     .then(() => mockServer.simulateDisconnect(peer))
    //     .then(() => done());
    // });
  });
});
