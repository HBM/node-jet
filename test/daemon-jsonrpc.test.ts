import { JsonRPC } from "../src/jet/daemon/jsonrpc";

/* global describe it beforeEach */
const sinon = require("sinon");

describe("The (daemon) jsonrpc module", function () {
  it("provides jsonrpc.JsonRPC ctor", function () {
    expect(JsonRPC).toBeInstanceOf(Function);
  });

  describe("a JsonRPC instance ji.dispatch", function () {
    let ji;
    const services = {} as any;
    const router = {} as any;
    const peer = {} as any;

    beforeEach(function () {
      services.test = sinon.spy();
      router.response = sinon.spy();
      peer.sendMessage = sinon.spy();
      ji = new JsonRPC(services, router);
    });

    it("valid request known method/service gets called", function () {
      const msg = {
        id: 1,
        method: "test",
      };
      ji.dispatch(peer, JSON.stringify(msg));
      expect(services.test.callCount).toEqual(1);
      expect(services.test.calledWith(peer, msg)).toBeTruthy(); // eslint-disable-line no-unused-expressions
    });

    it("valid notification known method/service gets called", function () {
      const msg = {
        method: "test",
      };
      ji.dispatch(peer, JSON.stringify(msg));
      expect(services.test.callCount).toEqual(1);
      expect(services.test.calledWith(peer, msg)).toBeTruthy(); // eslint-disable-line no-unused-expressions
    });

    it("valid request unknown method/service gets not called", function () {
      const msg = {
        id: 1,
        method: "xxx",
      };
      ji.dispatch(peer, JSON.stringify(msg));
      expect(services.test.callCount).toEqual(0);
      expect(peer.sendMessage.callCount).toEqual(1);
      const errMsg = peer.sendMessage.args[0][0];
      expect(errMsg.error.code).toEqual(-32601);
      expect(errMsg.error.message).toEqual("Method not found");
    });

    it("valid notification unknown method/service gets not called", function () {
      const msg = {
        method: "xxx",
      };
      ji.dispatch(peer, JSON.stringify(msg));
      expect(services.test.callCount).toEqual(0);
      expect(peer.sendMessage.callCount).toEqual(0);
    });

    it("invalid request", function () {
      const msg = {
        id: 123,
        abc: "xxx",
      };
      ji.dispatch(peer, JSON.stringify(msg));
      expect(services.test.callCount).toEqual(0);
      expect(peer.sendMessage.callCount).toEqual(1);
      const errMsg = peer.sendMessage.args[0][0];
      expect(errMsg.error.code).toEqual(-32600);
      expect(errMsg.error.message).toEqual("Invalid Request");
    });

    it("invalid notification", function () {
      const msg = {
        abc: "xxx",
      };
      ji.dispatch(peer, JSON.stringify(msg));
      expect(services.test.callCount).toEqual(0);
      expect(peer.sendMessage.callCount).toEqual(0);
    });

    it("parse error", function () {
      const dispatchNonJson = function () {
        ji.dispatch(peer, "{foobar");
      };
      expect(dispatchNonJson).toThrow(/Unexpected token/);
      expect(services.test.callCount).toEqual(0);
      expect(peer.sendMessage.callCount).toEqual(1);
      const errMsg = peer.sendMessage.args[0][0];
      expect(errMsg.error.code).toEqual(-32700);
      expect(errMsg.error.message).toEqual("Parse error");
    });
  });
});
