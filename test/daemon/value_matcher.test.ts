import { Peer } from "../../src/3_jet/peer";
import * as JsonRPC from "../../src/2_jsonrpc/index";
import Method from "../../src/3_jet/peer/method";
import State from "../../src/3_jet/peer/state";
import { ValueType } from "../../src/3_jet/types";
import { Fetcher } from "../../src/jet";
import { create } from "../../src/3_jet/daemon/value_matcher";
import { FetchOptions } from "../../src/3_jet/messages";
describe("Testing Value matcher", () => {
  it("Should test greater than", () => {
    const params = {
      path: {},
      sort: {},
      id: "",
      value: { "": { operator: "greaterThan", value: 5 } },
    } as FetchOptions;
    const matcher = create(params);
    expect([4, 5, 6].filter((el) => matcher(el))).toEqual([6]);
  });
  it("Should test less than", () => {
    const params = {
      path: {},
      sort: {},
      id: "",
      value: { "": { operator: "lessThan", value: 5 } },
    } as FetchOptions;
    const matcher = create(params);
    expect([4, 5, 6].filter((el) => matcher(el))).toEqual([4]);
  });
  it("Should test equal", () => {
    const params = {
      path: {},
      sort: {},
      id: "",
      value: { "": { operator: "equals", value: 5 } },
    } as FetchOptions;
    const matcher = create(params);
    expect([4, 5, 6].filter((el) => matcher(el))).toEqual([5]);
  });
  it("Should test equals not", () => {
    const params = {
      path: {},
      sort: {},
      id: "",
      value: { "": { operator: "equalsNot", value: 5 } },
    } as FetchOptions;
    const matcher = create(params);
    expect([4, 5, 6].filter((el) => matcher(el))).toEqual([4, 6]);
  });
  it("Should test is Type", () => {
    const params = {
      path: {},
      sort: {},
      id: "",
      value: { "": { operator: "isType", value: "number" } },
    } as FetchOptions;
    const matcher = create(params);
    expect([4, "5", 6].filter((el) => matcher(el))).toEqual([4, 6]);
  });
  it("Should test invalid operator", () => {
    const params = {
      path: {},
      sort: {},
      id: "",
      value: { "": { operator: "foo", value: "number" } },
    } as any;
    try {
      const matcher = create(params);
    } catch (ex) {
      expect(ex).toEqual({
        code: -32602,
        data: "unknown generator foo",
        message: "Invalid params",
      });
    }
  });
  it("Should test invalid values", () => {
    const params = {
      path: {},
      sort: {},
      id: "",
      value: { "": { operator: "greaterThan", value: 5 } },
    } as any;
    const matcher = create(params);
    expect([{ id: 4 }, undefined, 6].filter((el) => matcher(el))).toEqual([6]);
  });
  it("Should test no value", () => {
    const params = {
      path: {},
      sort: {},
      id: "",
    } as any;
    const matcher = create(params);
    expect([4, "5", 6].filter((el) => matcher(el))).toEqual([4, "5", 6]);
  });
});
