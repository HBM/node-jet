import {
  castMessage,
  ConfigureRequest,
  InfoRequest,
} from "../src/3_jet/messages";
import { DaemonError } from "../src/3_jet/errors";
describe("Testing message casting", () => {
  it("Id error", () => {
    try {
      castMessage<InfoRequest>({} as any);
    } catch (ex) {
      expect(ex).toBeInstanceOf(DaemonError);
      expect(ex.toString()).toEqual("jet.DaemonError: No id");
    }
  });
  it("Method error", () => {
    try {
      castMessage<InfoRequest>({ id: "abc" } as any);
    } catch (ex) {
      expect(ex).toBeInstanceOf(DaemonError);
      expect(ex.toString()).toEqual("jet.DaemonError: No method");
    }
  });

  it("Should parse Info", () => {
    const msg = castMessage<InfoRequest>({ id: "abc", method: "info" } as any);
    expect(typeof msg).toEqual("object");
  });
  it("Configure error", () => {
    try {
      const msg = castMessage<ConfigureRequest>({
        id: "abc",
        method: "configure",
        params: { foo: "bar" },
      } as any);
    } catch (ex) {
      expect(ex.message).toEqual("Invalid params");
    }
  });
  it("Should parse Configure", () => {
    const msg = castMessage<InfoRequest>({
      id: "abc",
      method: "configure",
      params: { name: "Peer 1" },
    } as any);
    expect(typeof msg).toEqual("object");
  });
  it("Add without path", () => {
    try {
      castMessage<InfoRequest>({ id: "abc", method: "add" } as any);
    } catch (ex) {
      expect(ex.message).toEqual("Invalid params");
    }
  });
  it("Should parse Add", () => {
    const msg = castMessage<InfoRequest>({
      id: "abc",
      method: "add",
      params: { path: "myFunction" },
    } as any);
    expect(typeof msg).toEqual("object");
  });
  it("Remove without path", () => {
    try {
      castMessage<InfoRequest>({ id: "abc", method: "remove" } as any);
    } catch (ex) {
      expect(ex.message).toEqual("Invalid params");
    }
  });
  it("Should parse Remove", () => {
    const msg = castMessage<InfoRequest>({
      id: "abc",
      method: "remove",
      params: { path: "myFunction" },
    } as any);
    expect(typeof msg).toEqual("object");
  });
  it("fetch without id", () => {
    try {
      castMessage<InfoRequest>({
        id: "abc",
        method: "fetch",
        params: { path: { equals: "foo" } },
      } as any);
    } catch (ex) {
      expect(ex.message).toEqual("Invalid params");
    }
  });
  it("Should parse fetch", () => {
    const msg = castMessage<InfoRequest>({
      id: "abc",
      method: "fetch",
      params: { path: { equals: "foo" }, id: "__f__1" },
    } as any);
    expect(typeof msg).toEqual("object");
  });
  it("Unfetch without path", () => {
    try {
      castMessage<InfoRequest>({ id: "abc", method: "unfetch" } as any);
    } catch (ex) {
      expect(ex.message).toEqual("Invalid params");
    }
  });
  it("Should parse Unfetch", () => {
    const msg = castMessage<InfoRequest>({
      id: "abc",
      method: "unfetch",
      params: { id: "__f__1" },
    } as any);
    expect(typeof msg).toEqual("object");
  });
  it("Change without value", () => {
    try {
      castMessage<InfoRequest>({
        id: "abc",
        method: "change",
        params: { path: "foo" },
      } as any);
    } catch (ex) {
      expect(ex.message).toEqual("Invalid params");
    }
  });
  it("Should parse change", () => {
    const msg = castMessage<InfoRequest>({
      id: "abc",
      method: "change",
      params: { path: "foo", value: 4 },
    } as any);
    expect(typeof msg).toEqual("object");
  });
});
