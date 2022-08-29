import * as Sock from "../../src/1_socket/socket";
import { sockMock } from "../mocks/sock";
import JsonRPC from "../../src/2_jsonrpc";
import { Logger } from "../../src/3_jet/log";
import { LogLevel } from "../../src/";
import waitForExpect from "wait-for-expect";
import { INVALID_PARAMS_CODE } from "../../src/jet";
describe("Testing JsonRpc", () => {
  it("Should test basic functionality", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc
      .connect(new AbortController())
      .then(() => jsonrpc.connect(new AbortController()))
      .then(() => {
        jsonrpc.close().then(() => done());
        sock.emit("close");
      });
    sock.emit("open");
  });
  it("Should test abort ", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    const jsonrpc = new JsonRPC(new Logger());
    const abortControler = new AbortController();
    jsonrpc
      .connect(abortControler)
      .then(() => console.log("Connected"))
      .catch(() => done());
    abortControler.abort();
    sock.emit("open");
  });
  it("Should test disconnect ", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc
      .send("add", { path: "foo", value: 3 })
      .catch((ex) =>
        expect(ex.toString()).toEqual(
          "jet.ConnectionClosed: Connection is closed"
        )
      )
      .then(() => jsonrpc.notify("_f", { event: "Add", path: "foo", value: 1 }))
      .catch((ex) =>
        expect(ex.toString()).toEqual(
          "jet.ConnectionClosed: Connection is closed"
        )
      )
      .then(() => jsonrpc.close())
      .then(() => done());
  });

  it("Should test send", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    jest.spyOn(sock, "send").mockImplementation((msg) => {
      expect(msg).toEqual(
        JSON.stringify({
          id: "1",
          method: "add",
          params: { path: "foo", value: 3 },
        })
      );
      done();
    });
    const jsonrpc = new JsonRPC(new Logger(), {}, sock);
    jsonrpc.send("add", { path: "foo", value: 3 });
  });
  it("Should test batch send", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    jest.spyOn(sock, "send").mockImplementation((msg) => {
      expect(msg).toEqual(
        JSON.stringify([
          { id: "1", method: "add", params: { path: "foo", value: 3 } },
          { id: "2", method: "add", params: { path: "foo1", value: 4 } },
          { id: "3", method: "add", params: { path: "foo2", value: 5 } },
          { id: "4", method: "add", params: { path: "foo3", value: 6 } },
        ])
      );
      done();
    });
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.connect().then(() => {
      jsonrpc.batch(() => {
        jsonrpc.send("add", { path: "foo", value: 3 });
        jsonrpc.send("add", { path: "foo1", value: 4 });
        jsonrpc.send("add", { path: "foo2", value: 5 });
        jsonrpc.send("add", { path: "foo3", value: 6 });
      });
    });
    sock.emit("open");
  });
  it("Should test notify", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    jest.spyOn(sock, "send").mockImplementation((msg) => {
      expect(msg).toEqual(
        JSON.stringify({
          id: "_",
          method: "_f",
          params: { event: "Add", path: "foo", value: 1 },
        })
      );
      done();
    });
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc
      .connect()
      .then(() =>
        jsonrpc.notify("_f", { event: "Add", path: "foo", value: 1 })
      );
    sock.emit("open");
  });
  it("Should test batch notify", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    jest.spyOn(sock, "send").mockImplementation((msg) => {
      expect(
        JSON.stringify([
          {
            id: "_",
            method: "_f",
            params: { event: "Add", path: "foo", value: 1 },
          },
          {
            id: "_",
            method: "_f",
            params: { event: "Add", path: "foo", value: 2 },
          },
          {
            id: "_",
            method: "_f",
            params: { event: "Add", path: "foo", value: 3 },
          },
        ])
      ).toContain(msg);
    });
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc
      .connect(new AbortController())
      .then(() =>
        jsonrpc.batch(() => {
          jsonrpc.notify("_f", { event: "Add", path: "foo", value: 1 });
          jsonrpc.notify("_f", { event: "Add", path: "foo", value: 2 });
          jsonrpc.notify("_f", { event: "Add", path: "foo", value: 3 });
        })
      )

      .then(() => waitForExpect(() => expect(sock.send).toBeCalledTimes(1)))
      .then(done());
    sock.emit("open");
  });
  it("Should test single batch notify", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    jest.spyOn(sock, "send").mockImplementation((msg) => {
      expect(
        JSON.stringify([
          {
            id: "_",
            method: "_f",
            params: { event: "Add", path: "foo", value: 1 },
          },
        ])
      ).toContain(msg);
    });
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc
      .connect(new AbortController())
      .then(() =>
        jsonrpc.batch(() => {
          jsonrpc.notify("_f", { event: "Add", path: "foo", value: 1 });
        })
      )

      .then(() => waitForExpect(() => expect(sock.send).toBeCalledTimes(1)))
      .then(done());
    sock.emit("open");
  });
  it("Should test invalid request", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    const logger = new Logger({
      logname: "Mock",
      loglevel: LogLevel.error,
      logCallbacks: [
        (msg) => {
          console.log(msg);
          expect(msg).toContain(
            "Mock	error	SyntaxError: Unexpected token I in JSON at position 0"
          );
          done();
        },
      ],
    });
    const jsonrpc = new JsonRPC(logger);
    jsonrpc.connect(new AbortController()).then(() => {
      const json = "Invalid Json";
      sock.emit("message", { data: json });
    });
    sock.emit("open");
  });
  it("Should log socket errors", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    const logger = new Logger({
      logname: "Mock",
      loglevel: LogLevel.error,
      logCallbacks: [
        (msg) => {
          console.log(msg);
          expect(msg).toContain(
            "Mock	error	Error in socket connection:sock error"
          );
          done();
        },
      ],
    });
    const jsonrpc = new JsonRPC(logger);
    jsonrpc
      .connect(new AbortController())
      .then(() => sock.emit("error", "sock error"));
    sock.emit("open");
  });
  it("Should test incoming request", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);

    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.connect(new AbortController()).then(() => {
      jsonrpc.addListener("add", (_peer, id, msg) => {
        expect(id).toEqual("1");
        expect(msg).toEqual({ event: "Add", path: "foo", value: 1 });
        done();
      });
      const json = JSON.stringify({
        id: "1",
        method: "add",
        params: { event: "Add", path: "foo", value: 1 },
      });
      sock.emit("message", { data: json });
    });
    sock.emit("open");
  });
  it("Should test incoming request array", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    const msgMock = jest.fn();
    const messages = [
      {
        id: "1",
        method: "add",
        params: { event: "Add", path: "foo", value: 1 },
      },
      {
        id: "3",
        method: "add",
        params: { event: "Add", path: "foo", value: 1 },
      },
      {
        id: "4",
        method: "add",
        params: { event: "Add", path: "foo", value: 1 },
      },
    ];
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.addListener("add", () => msgMock());
    jsonrpc
      .connect(new AbortController())
      .then(() => {
        jsonrpc.addListener("add", (_peer, id, msg) => {
          expect(["1", "3", "4"]).toContainEqual(id);
          expect(messages.map((msg) => msg.params)).toContainEqual(msg);
        });

        sock.emit("message", { data: JSON.stringify(messages) });
      })
      .then(() => waitForExpect(() => expect(msgMock).toBeCalledTimes(3)))
      .then(() => done());
    sock.emit("open");
  });
  it("Should test incoming request", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);

    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.connect(new AbortController()).then(() => {
      jsonrpc.addListener("add", (_peer, id, msg) => {
        expect(id).toEqual("1");
        expect(msg).toEqual({ event: "Add", path: "foo", value: 1 });
        done();
      });
      const json = JSON.stringify({
        id: "1",
        method: "add",
        params: { event: "Add", path: "foo", value: 1 },
      });
      sock.emit("message", { data: json });
    });
    sock.emit("open");
  });
  it("Should test invalid method", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    const msgMock = jest.fn();
    const message = {
      id: "1",
      method: "foo",
      params: { event: "Add", path: "foo", value: 1 },
    };
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc
      .connect(new AbortController())
      .then(() => {
        sock.emit("message", { data: JSON.stringify(message) });
      })
      .then(() =>
        waitForExpect(() =>
          expect(sock.send).toBeCalledWith(
            JSON.stringify({
              id: "1",
              error: { message: "Method not found", code: -32601, data: "foo" },
            })
          )
        )
      )
      .then(() => done());
    sock.emit("open");
  });
  it("Should respond", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    jest.spyOn(sock, "send").mockImplementation((msg) => {
      expect(msg).toEqual(JSON.stringify({ id: "id", result: {} }));
      done();
    });
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.connect().then(() => jsonrpc.respond("id", {}, true));
    sock.emit("open");
  });
  it("Should respond error", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);
    jest.spyOn(sock, "send").mockImplementation((msg) => {
      expect(msg).toEqual(JSON.stringify({ id: "id", error: {} }));
      done();
    });
    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.connect().then(() => jsonrpc.respond("id", {}, false));
    sock.emit("open");
  });
  it("Should test result response", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);

    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.connect().then(() => {
      jsonrpc.send("add", { path: "foo" }).then((res) => {
        expect(res).toEqual("this is my result");
        done();
      });
      const json = JSON.stringify({ id: "1", result: "this is my result" });
      sock.emit("message", { data: json });
    });
    sock.emit("open");
  });

  it("Should test error response", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);

    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.connect().then(() => {
      jsonrpc.send("add", { path: "foo" }).catch((res) => {
        expect(res).toEqual("this is my error");
        done();
      });
      const json = JSON.stringify({ id: "1", error: "this is my error" });
      sock.emit("message", { data: json });
    });
    sock.emit("open");
  });

  it("Should test error object response", (done) => {
    const sock = sockMock();
    jest.spyOn(Sock, "Socket").mockImplementation(() => sock);

    const jsonrpc = new JsonRPC(new Logger());
    jsonrpc.connect().then(() => {
      jsonrpc.send("add", { path: "foo" }).catch((res) => {
        expect(res.toString()).toEqual(
          "jet.NotFound: No State/Method matching the specified path"
        );
        done();
      });
      const json = JSON.stringify({
        id: "1",
        error: { code: INVALID_PARAMS_CODE, data: { pathNotExists: "Foo" } },
      });
      sock.emit("message", { data: json });
    });
    sock.emit("open");
  });
});
