import { Peer } from "../../src/3_jet/peer";
import * as JsonRPC from "../../src/2_jsonrpc/index";
import Method from "../../src/3_jet/peer/method";
import State from "../../src/3_jet/peer/state";
import { ValueType } from "../../src/3_jet/types";
import { Fetcher } from "../../src/jet";
import { fullFetcherPeer, simpleFecherPeer } from "../mocks/jsonrpc";
import { createPathMatcher } from "../../src/3_jet/daemon/path_matcher";
import { FetchOptions } from "../../src/3_jet/messages";
describe("Testing Path matcher", () => {
  it("Should match path", () => {
    const params = {
      path: { startsWith: "a" },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([
      "a",
      "ab",
      "abc",
    ]);
  });

  it("Should match path", () => {
    const params = {
      path: { startsWith: "a", endsWith: "b" },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual(["ab"]);
  });
  it("Should match path", () => {
    const params = {
      path: { equalNot: "a", endsWith: "b" },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([
      "b",
      "ab",
    ]);
  });
  it("Equals one of", () => {
    const params = {
      path: { equalsOneOf: ["a", "b", "ab"] },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([
      "a",
      "b",
      "ab",
    ]);
  });
  it("Equals", () => {
    const params = { path: { equals: "a" }, sort: {}, id: "" } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual(["a"]);
  });
  it("contains", () => {
    const params = {
      path: { contains: "b" },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([
      "b",
      "ab",
      "abc",
    ]);
  });
  it("containsNot", () => {
    const params = {
      path: { containsNot: "b" },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([]);
  });

  it("containsAllOf", () => {
    const params = {
      path: { containsAllOf: ["a", "b", "c"] },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([
      "abc",
    ]);
  });
  it("containsOneOf", () => {
    const params = {
      path: { containsOneOf: ["abc", "ab"] },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([
      "ab",
      "abc",
    ]);
  });
  it("Case insensitive path", () => {
    const params = {
      path: { startsWith: ["a", "b"], endsWith: "b", caseInsensitive: "true" },
      sort: {},
      id: "",
    } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([]);
  });
  it("No path rules", () => {
    const params = { sort: {}, id: "" } as FetchOptions;
    const matcher = createPathMatcher(params);
    expect(["a", "b", "ab", "abc"].filter((el) => matcher(el))).toEqual([
      "a",
      "b",
      "ab",
      "abc",
    ]);
  });
});
