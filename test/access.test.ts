/* global describe it */
/* eslint-disable no-unused-expressions */

import { intersects } from "../src/jet/daemon/access";

describe("The jet.daemon.access module", function () {
  it('intersects(["a","b"],["b","c"]) === true', function () {
    expect(intersects(["a", "b"], ["b", "c"])).toBeTruthy();
  });

  it('intersects(["a"],["b","c","a"]) === true', function () {
    expect(intersects(["a"], ["b", "c", "a"])).toBeTruthy();
  });

  it('intersects(["a","b","c"],["c"]) === true', function () {
    expect(intersects(["a", "b", "c"], ["c"])).toBeTruthy();
  });

  it('intersects(["a","b"],["c","b"]) === true', function () {
    expect(intersects(["a", "b"], ["c", "b"])).toBeTruthy();
  });

  it('intersects(["a","b"],["e","c"]) === false', function () {
    expect(intersects(["a", "b"], ["e", "c"])).toBeFalsy();
  });
});
