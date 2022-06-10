/* global describe it */

import { eachKeyValue } from "../src/jet/utils";

const sinon = require("sinon");

describe("The utils module", function () {
  it("utils.eachKeyValue", function () {
    const x = {
      a: 1,
      b: 3,
      c: 2223,
    };
    const eachX = eachKeyValue(x);
    const spy = sinon.spy();
    eachX(spy);

    expect(spy.callCount).toEqual(3);
    expect(spy.args[0]).toEqual(["a", 1]);
    expect(spy.args[1]).toEqual(["b", 3]);
    expect(spy.args[2]).toEqual(["c", 2223]);
  });
});
