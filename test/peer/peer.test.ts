import { Peer } from "../../src/3_jet/peer";
import * as JsonRPC from "../../src/2_jsonrpc/index";
import Method from "../../src/3_jet/peer/method";
import State from "../../src/3_jet/peer/state";
import { ValueType } from "../../src/3_jet/types";
import { Fetcher } from "../../src/jet";
import { fullFetcherPeer, simpleFecherPeer } from "../mocks/peer";
describe("Testing Peer", () => {
  describe("Should handle daemon messages", () => {
    it("Should send different messages", (done) => {
      let cb;
      const peerMock = fullFetcherPeer();
      peerMock.addListener = jest
        .fn()
        .mockImplementation((eventName, callback) => {
          expect(eventName).toEqual("message");
          cb = callback;
          return peerMock;
        });
      jest.spyOn(JsonRPC, "default").mockImplementation(() => peerMock);
      const peer = new Peer();
      peer
        .connect()
        .then(() => peer.add(new State<ValueType>("foo", 5)))
        .then(() => peer.add(new Method("bar")))
        .then(() => peer.fetch(new Fetcher().path("equals", "foo")))
        .then(() => {
          cb("get", { params: { path: "foo" } });
          expect(peerMock.respond).toBeCalledWith(
            undefined,
            { path: "foo", value: 5 },
            true
          );
          cb("set", { params: { path: "foo", value: 8 } });
          expect(peerMock.respond).toBeCalledWith(undefined, {}, true);
          cb("call", { params: { path: "bar" } });
          expect(peerMock.respond).toBeCalledWith(undefined, {}, true);
          cb("___f___1", { params: { path: "bar" } });
          peer.close();
          done();
        });
    });
    it("Should send different messages simpleFetch", (done) => {
      let cb;
      const peerMock = simpleFecherPeer();
      peerMock.addListener = jest
        .fn()
        .mockImplementation((eventName, callback) => {
          expect(eventName).toEqual("message");
          cb = callback;
          return peerMock;
        });
      jest.spyOn(JsonRPC, "default").mockImplementation(() => peerMock);
      const peer = new Peer();
      peer
        .connect()
        .then(() => peer.add(new State<ValueType>("foo", 5)))
        .then(() => peer.add(new Method("bar")))
        .then(() => peer.fetch(new Fetcher().path("equals", "foo")))
        .then(() => {
          cb("get", { params: { path: "foo" } });
          expect(peerMock.respond).toBeCalledWith(
            undefined,
            { path: "foo", value: 5 },
            true
          );
          cb("set", { params: { path: "foo", value: 8 } });
          expect(peerMock.respond).toBeCalledWith(undefined, {}, true);
          cb("call", { params: { path: "bar" } });
          expect(peerMock.respond).toBeCalledWith(undefined, {}, true);
          cb("fetch_all", { params: { path: "foo" } });
          done();
        });
    });
  });
  describe("Should connect to daemon", () => {
    it("Should fail to connect", (done) => {
      const connectSpy = jest
        .fn()
        .mockReturnValue(Promise.reject("could not connect"));
      const jsonrpc = { ...fullFetcherPeer(), connect: connectSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.connect().catch((ex) => {
        expect(connectSpy).toBeCalled();
        expect(ex).toBe("could not connect");
        done();
      });
    });
    it("Should fail to authenticate", (done) => {
      const connectSpy = jest.fn().mockReturnValue(Promise.resolve());
      const sendSpy = jest
        .fn()
        .mockImplementation((method, _args) =>
          method === "authenticate"
            ? Promise.reject("Wrong credentials")
            : Promise.resolve({})
        );
      const jsonrpc = {
        ...fullFetcherPeer(),
        connect: connectSpy,
        send: sendSpy,
      };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer({ user: "foo", password: "bar" });
      peer
        .connect()
        .then(() => {
          console.log("entered then");
        })
        .catch((ex) => {
          expect(connectSpy).toBeCalled();
          expect(sendSpy).toBeCalledWith("info", {});
          expect(sendSpy).toBeCalledWith("authenticate", {
            password: "bar",
            user: "foo",
          });
          expect(ex).toBe("Wrong credentials");
          done();
        });
    });

    it("Should connect peer without credentials", (done) => {
      const connectSpy = jest.fn().mockReturnValue(Promise.resolve());
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve());
      const jsonrpc = {
        ...fullFetcherPeer(),
        connect: connectSpy,
        send: sendSpy,
      };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.connect().then(() => {
        expect(connectSpy).toBeCalled();
        expect(sendSpy).toBeCalledWith("info", {});
        done();
      });
    });
    it("Should connect to peer with credentials", (done) => {
      const connectSpy = jest.fn().mockReturnValue(Promise.resolve());
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve());
      const jsonrpc = {
        ...fullFetcherPeer(),
        connect: connectSpy,
        send: sendSpy,
      };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer({ user: "foo", password: "bar" });
      peer.connect().then(() => {
        expect(connectSpy).toBeCalled();
        expect(sendSpy).toBeCalledWith("info", {});
        expect(sendSpy).toBeCalledWith("authenticate", {
          password: "bar",
          user: "foo",
        });
        done();
      });
    });
  });
  describe("Should test add methods", () => {
    it("Should fail to add a state", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject("invalid path"));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.add(new State<ValueType>("My path", 3)).catch((ex) => {
        expect(sendSpy).toBeCalledWith("add", { path: "My path", value: 3 });
        expect(ex).toBe("invalid path");
        done();
      });
    });
    it("Should add a state and change the value", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      const myState = new State<ValueType>("My path", 4);
      peer.add(myState).then(() => {
        expect(sendSpy).toBeCalledWith("add", { path: "My path", value: 4 });
        myState.value(6);
        expect(sendSpy).toBeCalledWith("change", { path: "My path", value: 6 });
        done();
      });
    });
    it("Should add a method", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.add(new Method("My path")).then(() => {
        expect(sendSpy).toBeCalledWith("add", { path: "My path" });
        done();
      });
    });
    it("Should add a method", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.add(new Method("My path")).then(() => {
        expect(sendSpy).toBeCalledWith("add", { path: "My path" });
        done();
      });
    });
    it("Should create batch", () => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.batch(() => {});
    });
    it("Should send configure", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.configure({}).then(() => {
        expect(sendSpy).toBeCalledWith("config", {});
        done();
      });
    });
  });
  describe("Should test removing a state", () => {
    it("Should fail to remove a state", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject("invalid path"));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.remove(new State<ValueType>("My path", 5)).catch((ex) => {
        expect(sendSpy).toBeCalledWith("remove", { path: "My path" });
        expect(ex).toBe("invalid path");
        done();
      });
    });
    it("Should remove a state", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.remove(new State<ValueType>("My path", 5)).then(() => {
        expect(sendSpy).toBeCalledWith("remove", { path: "My path" });
        done();
      });
    });
  });
  describe("Should test getting a state", () => {
    it("Should fail to get a state", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject("invalid path"));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.get({ path: { startsWith: "a" } }).catch((ex) => {
        expect(sendSpy).toBeCalledWith("get", { path: { startsWith: "a" } });
        expect(ex).toBe("invalid path");
        done();
      });
    });
    it("Should get a state", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve(5));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.get({ path: { startsWith: "a" } }).then((res) => {
        expect(sendSpy).toBeCalledWith("get", { path: { startsWith: "a" } });
        expect(res).toBe(5);
        done();
      });
    });
  });

  describe("Should test setting a state", () => {
    it("Should fail to set a state", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject("invalid path"));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.set("Foo", 5, { timeout: 5, valueAsResult: true }).catch((ex) => {
        expect(sendSpy).toBeCalledWith("set", {
          path: "Foo",
          value: 5,
          timeout: 5,
          valueAsResult: true,
        });
        expect(ex).toBe("invalid path");
        done();
      });
    });
    it("Should set a state", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve(5));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.set("Foo", 5).then((res) => {
        expect(sendSpy).toBeCalledWith("set", { path: "Foo", value: 5 });
        expect(res).toBe(5);
        done();
      });
    });
  });
  describe("Should test calling a method", () => {
    it("Should fail to call a method", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject("invalid path"));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.call("Foo", [5], { timeout: 5 }).catch((ex) => {
        expect(sendSpy).toBeCalledWith("call", {
          path: "Foo",
          args: [5],
          timeout: 5,
        });
        expect(ex).toBe("invalid path");
        done();
      });
    });
    it("Should call a method", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.call("Foo", { abc: 4 }).then((res) => {
        expect(sendSpy).toBeCalledWith("call", {
          path: "Foo",
          args: { abc: 4 },
        });
        expect(res).toEqual({});
        done();
      });
    });
  });
  describe("Should test calling a method", () => {
    it("Should fail to call a method", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject("invalid path"));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.call("Foo", [5], { timeout: 5 }).catch((ex) => {
        expect(sendSpy).toBeCalledWith("call", {
          path: "Foo",
          args: [5],
          timeout: 5,
        });
        expect(ex).toBe("invalid path");
        done();
      });
    });
    it("Should call a method", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.resolve({}));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.call("Foo", { abc: 4 }).then((res) => {
        expect(sendSpy).toBeCalledWith("call", {
          path: "Foo",
          args: { abc: 4 },
        });
        expect(res).toEqual({});
        done();
      });
    });
  });
  describe("Should test fetching", () => {
    it("Should fail to fetch", (done) => {
      const sendSpy = jest.fn().mockReturnValue(Promise.reject("invalid path"));
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer.fetch(new Fetcher()).catch((ex) => {
        expect(sendSpy).toBeCalledWith("fetch", {
          id: "___f___1",
          path: {},
          sort: {},
        });
        expect(ex).toBe("invalid path");
        done();
      });
    });
    it("Should fetch", (done) => {
      const sendSpy = jest
        .fn()
        .mockImplementation((method) =>
          method === "info"
            ? Promise.resolve({ features: { fetch: "full" } })
            : Promise.resolve([4, 3, 2])
        );
      const jsonrpc = { ...fullFetcherPeer(), send: sendSpy };
      jest.spyOn(JsonRPC, "default").mockImplementation(() => jsonrpc);
      const peer = new Peer();
      peer
        .connect()
        .then(() => peer.fetch(new Fetcher().path("startsWith", "a")))
        .then((res) => {
          expect(sendSpy).toBeCalledWith("fetch", {
            id: "___f___1",
            path: { startsWith: "a" },
            sort: {},
          });
          expect(res).toEqual([4, 3, 2]);
        })
        .then(() => peer.fetch(new Fetcher().path("equals", "b")))
        .then((res) => {
          expect(sendSpy).toBeCalledWith("fetch", {
            id: "___f___2",
            path: { equals: "b" },
            sort: {},
          });
          expect(res).toEqual([4, 3, 2]);
          done();
        });
    });
    it("Should simple fetch", (done) => {
      const mockPeer = simpleFecherPeer();
      jest.spyOn(JsonRPC, "default").mockImplementation(() => mockPeer);
      const peer = new Peer();
      peer
        .connect()
        .then(() => peer.fetch(new Fetcher().path("startsWith", "a")))
        .then((res) => {
          expect(mockPeer.send).toBeCalledWith("fetch", { id: "fetch_all" });
          expect(res).toEqual([]);
        })
        .then(() => peer.fetch(new Fetcher().path("equals", "b")))
        .then(() => {
          expect(mockPeer.send).toBeCalledTimes(2);
          done();
        });
    });
  });
  describe("Should test unfetching", () => {
    it("Should fail to unfetch", (done) => {
      jest.spyOn(JsonRPC, "default").mockReturnValue(fullFetcherPeer());
      const peer = new Peer();
      peer.unfetch(new Fetcher()).catch((ex) => {
        expect(ex).toBe("Could not find fetcher");
        done();
      });
    });
    it("Should unfetch full", (done) => {
      const sendSpy = jest
        .fn()
        .mockImplementation((method) =>
          method === "info"
            ? Promise.resolve({ features: { fetch: "full" } })
            : Promise.resolve([])
        );

      jest
        .spyOn(JsonRPC, "default")
        .mockReturnValue({ ...fullFetcherPeer(), send: sendSpy });
      const peer = new Peer();
      const fetcher = new Fetcher();
      peer
        .connect()
        .then(() => peer.fetch(fetcher))
        .then(() => peer.unfetch(fetcher))
        .then(() => {
          expect(sendSpy).toBeCalledWith("unfetch", { id: "___f___1" });
          done();
        });
    });

    it("Should unfetch simple", (done) => {
      const sendSpy = jest
        .fn()
        .mockImplementation((method) =>
          method === "info"
            ? Promise.resolve({ features: { fetch: "simple" } })
            : Promise.resolve([])
        );
      jest
        .spyOn(JsonRPC, "default")
        .mockReturnValue({ ...simpleFecherPeer(), send: sendSpy });
      const peer = new Peer();
      const fetcher = new Fetcher();
      const f2 = new Fetcher();
      peer
        .connect()
        .then(() => expect(sendSpy).toBeCalledTimes(1))
        .then(() => peer.fetch(fetcher))
        .then(() => expect(sendSpy).toBeCalledTimes(2))
        .then(() => peer.fetch(f2))
        .then(() => expect(sendSpy).toBeCalledTimes(2))
        .then(() => peer.unfetch(fetcher))
        .then(() => expect(sendSpy).toBeCalledTimes(2))
        .then(() => peer.unfetch(f2))
        .then(() => {
          //Only send unfetch event when no fetchers are registered anymore
          expect(sendSpy).toBeCalledTimes(3);
          expect(sendSpy).toBeCalledWith("unfetch", { id: "fetch_all" });
          done();
        });
    });
  });
});
