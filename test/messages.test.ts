import {
  castMessage,
  ConfigureRequest,
  InfoRequest,
} from "../src/3_jet/messages";
import { InvalidArgument, invalidRequest } from "../src/3_jet/errors";
describe("Testing message casting", () => {
  it("Id error", () => {
    expect(() => castMessage<InfoRequest>({} as any)).toThrow(
      new invalidRequest("no method")
    );
  });
  it("Method error", () => {
    expect(() => castMessage<InfoRequest>({ id: "abc" } as any)).toThrow(
      new invalidRequest("no method")
    );
  });

  it("Should parse Info", () => {
    const msg = castMessage<InfoRequest>({ id: "abc", method: "info" } as any);
    expect(typeof msg).toEqual("object");
  });
  it("Configure error", () => {
    expect(() =>
      castMessage<ConfigureRequest>({
        id: "abc",
        method: "configure",
        params: { foo: "bar" },
      } as any)
    ).toThrow(new InvalidArgument("no method"));
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
    expect(() =>
      castMessage<InfoRequest>({ id: "abc", method: "add" } as any)
    ).toThrow(new InvalidArgument("no method"));
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
    expect(() =>
      castMessage<InfoRequest>({ id: "abc", method: "remove" } as any)
    ).toThrow(new InvalidArgument("no method"));
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
    expect(() =>
      castMessage<InfoRequest>({
        id: "abc",
        method: "fetch",
        params: { path: { equals: "foo" } },
      } as any)
    ).toThrow(new InvalidArgument("no method"));
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
    expect(() =>
      castMessage<InfoRequest>({ id: "abc", method: "unfetch" } as any)
    ).toThrow(new InvalidArgument("Fetch id required"));
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
    expect(() =>
      castMessage<InfoRequest>({
        id: "abc",
        method: "change",
        params: { path: "foo" },
      } as any)
    ).toThrow(new InvalidArgument("Value required"));
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
