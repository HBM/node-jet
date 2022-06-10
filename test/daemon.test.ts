/* global describe it before */
/* eslint-disable no-unused-expressions */
import net from "net";
/* this is a private module, so load directly */
import { MessageSocket } from "../src/jet/message-socket";
import { Daemon, Peer, Method } from "../src/jet";
import EventEmitter from "events";
import http from "http";
import https from "https";
import fs from "fs";
import WebSocket from "ws";

const commandRequestTest = function (port, command, params, checkResult) {
  describe('who sends "' + command + '" as request', function () {
    let sender;
    beforeAll(function () {
      sender = new MessageSocket(port);
      sender.sendMessage = function (message) {
        sender.send(JSON.stringify(message));
      };
    });

    const id = Math.random();
    const request = {
      id: id,
      method: command,
      params: params,
    };

    it("sends back the correct result", function (done) {
      sender.once("message", function (response) {
        response = JSON.parse(response);
        expect(response.id).toEqual(request.id);
        if (checkResult) {
          checkResult(response.result, response.error);
        } else {
          expect(response.result).toBeTruthy();
          expect(response).toHaveProperty("error");
        }
        done();
      });
      sender.sendMessage(request);
    });
  });
};

const testPort = 33301;

describe("A Daemon with websockets", () => {
  let daemon;
  const wsPort = 11145;
  beforeAll(() => {
    daemon = new Daemon({});
    daemon.listen({ wsPingInterval: 10, wsPort: wsPort });
  });

  it("a ws client gets pinged", function (done) {
    const client = new WebSocket("ws://localhost:" + wsPort, "jet");
    client.onOpen = () => console.log("opened");
    client.on("ping", () => {
      client.close();
      done();
    });
  });

  it("a ws client which closes does not break the server", function (done) {
    const client = new WebSocket("ws://localhost:" + wsPort, "jet");
    client.on("open", function () {
      client.close();
      setTimeout(function () {
        done();
      }, 100);
    });
  });
});

describe("A Daemon", function () {
  let daemon;
  beforeAll(function () {
    daemon = new Daemon({});
    daemon.listen({
      tcpPort: testPort,
    });
  });

  it("should be instance of EventEmitter", function (done) {
    expect(daemon).toBeInstanceOf(EventEmitter);
    daemon.on("test", function (a, b) {
      expect(a).toEqual(1);
      expect(b).toEqual(2);
      done();
    });
    daemon.emit("test", 1, 2);
  });

  it('should emit "connection" for every new Peer', function (done) {
    daemon.once("connection", function (peerMs) {
      expect(peerMs).toBeInstanceOf(Object);
      done();
    });
    const sock = net.connect(testPort);
    expect(sock).toBeDefined();
  });

  describe('when connected to a peer sending "handmade" message', function () {
    commandRequestTest(
      testPort,
      "add",
      {
        path: "test",
        value: 123,
      },
      true
    );

    commandRequestTest(testPort, "info", {}, function (result) {
      expect(result.name).toEqual("node-jet");
      expect(result.version).toEqual("2.2.0");
      expect(result.protocolVersion).toEqual("1.1.0");
      expect(result.features.fetch).toEqual("full");
      expect(result.features.batches).toBeTruthy();
      expect(result.features.authentication).toBeTruthy();
    });

    commandRequestTest(
      testPort,
      "authenticate",
      {
        user: "foo",
        password: "bar",
      },
      function (result, error) {
        expect(result).toBeInstanceOf("undefined");
        expect(error.message).toEqual("Invalid params");
        expect(error.data.invalidUser).toBeTruthy();
      }
    );
  });

  it("releasing a peer (with fetchers and elements) does not brake", function (done) {
    const peer = new Peer({
      port: testPort,
    });

    const state = new jet.State("pathdoesnotmatter", 32);
    const fetcher = new jet.Fetcher();

    Promise.all([peer.connect(), peer.fetch(fetcher), peer.add(state)]).then(
      function () {
        peer.close();
      }
    );

    peer.closed().then(function () {
      done();
    });
  });

  it("daemon emits disconnect event when peer disconnects", function (done) {
    const peer = new Peer({
      port: testPort,
    });
    daemon.on("disconnect", function (peerMS) {
      expect(peerMS).toBeInstanceOf("object");
      done();
    });
    peer.connect().then(function () {
      peer.close();
    });
  });

  it("timeout response is generated", function (done) {
    const peer = new Peer({
      port: testPort,
    });

    const tooLate = new Method("alwaysTooLate");
    tooLate.on("call", function (args, reply) {
      setTimeout(function () {
        reply({
          result: 123,
        });
      }, 100);
    });

    Promise.all([
      peer.connect(),
      peer.add(tooLate),
      peer.call("alwaysTooLate", [1, 2], {
        timeout: 0.001,
      }),
    ]).catch(function (err) {
      expect(err).toBeInstanceOf(jet.PeerTimeout);
      done();
    });
  });

  describe("hooking to a (http) server", function () {
    let server;
    let daemon;

    beforeAll(function () {
      server = http.createServer(function (req, res) {
        res.writeHead(200, {
          "Content-Type": "text/plain",
        });
        res.end("Hello World\n");
      });
      server.listen(23456);
      daemon = new Daemon({});
      daemon.listen({
        server: server,
      });
    });

    it("http get works", function (done) {
      http.get(
        {
          hostname: "localhost",
          port: 23456,
        },
        function (res) {
          res.on("data", function (data) {
            expect(data.toString()).toEqual("Hello World\n");
            done();
          });
        }
      );
    });

    it("peer can connect via websockets on same port", function (done) {
      const peer = new Peer({
        url: "ws://localhost:23456",
        name: "blabla",
      });

      peer.connect().then(function () {
        peer.close();
        done();
      });
    });
  });

  describe("hooking to a (https) server", function () {
    let server;
    let daemon;

    beforeAll(function () {
      const options = {
        key: fs.readFileSync("test/fixtures/key.pem"),
        cert: fs.readFileSync("test/fixtures/certificate.pem"),
      };
      server = https.createServer(options, function (req, res) {
        res.writeHead(200, {
          "Content-Type": "text/plain",
        });
        res.end("Hello World\n");
      });
      server.listen(23490);
      daemon = new jet.Daemon();
      daemon.listen({
        server: server,
      });
    });

    it("https get works", function (done) {
      https.get(
        {
          hostname: "localhost",
          port: 23490,
          rejectUnauthorized: false,
        },
        function (res) {
          res.on("data", function (data) {
            expect(data.toString()).toEqual("Hello World\n");
            done();
          });
        }
      );
    });

    it("peer can connect via secure websockets (wss) on same port", function (done) {
      const peer = new Peer({
        url: "wss://localhost:23490",
        name: "blabla",
        rejectUnauthorized: false,
      });

      peer.connect().then(function () {
        peer.close();
        done();
      });
    });
  });
});

describe("A Daemon with simple fetching", function () {
  let daemon;
  beforeAll(function () {
    daemon = new Daemon({
      name: "simple-jet",
      features: {
        fetch: "simple",
      },
    });
    daemon.listen({
      tcpPort: testPort + 1,
    });
  });

  describe('when connected to a peer sending "handmade" message', function () {
    commandRequestTest(testPort + 1, "info", {}, function (result) {
      expect(result.name).toEqual("simple-jet");
      expect(result.version).toEqual("2.2.0");
      expect(result.protocolVersion).toEqual("1.1.0");
      expect(result.features.fetch).toEqual("simple");
      expect(result.features.batches).toBeTruthy();
      expect(result.features.authentication).toBeTruthy();
    });
  });
});

describe("A Daemon with specified users (authentication)", function () {
  const john = {
    password: "12345",
    auth: {
      fetchGroups: [],
      setGroups: [],
      callGroups: [],
    },
  };

  let daemon;
  beforeAll(function () {
    daemon = new Daemon({
      users: {
        john: john,
      },
    });
    daemon.listen({
      tcpPort: testPort + 2,
    });
  });

  describe('when connected to a peer sending "handmade" message', function () {
    commandRequestTest(
      testPort + 2,
      "authenticate",
      {
        user: "john",
        password: "12345",
      },
      function (result, error) {
        expect(error).toBeInstanceOf("undefined");
        expect(result).toEqual(john.auth);
      }
    );
  });
});
