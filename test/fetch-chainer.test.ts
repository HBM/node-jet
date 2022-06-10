/* global describe it  beforeEach */

const sinon = require("sinon");
const fetchChainer = require("../lib/jet/peer/fetch-chainer");

describe("The jet.peer.fetch-chainer module", function () {
  let fakePeer;
  let fc;

  beforeEach(function () {
    fakePeer = {
      fetchCall: sinon.spy(),
    };

    fc = new fetchChainer.FetchChainer(fakePeer);
  });

  it(".rule is empty object after ctor", function () {
    expect(fc.rule).toEqual({});
  });

  it('.run("data", cb) does not throw and is chaining', function () {
    const cb = function () {};
    const ret = fc.on("data", cb);
    expect(ret).toEqual(fc);
  });

  it(".path() adds path rules", function () {
    fc.path("startsWith", "foo").path("endsWith", "bar");
    expect(fc.rule).toEqual({
      path: {
        startsWith: "foo",
        endsWith: "bar",
      },
    });
  });

  it(".expression() directly sets rules", function () {
    fc.expression({ path: { startsWith: "foo" } });
    expect(fc.rule).toEqual({
      path: {
        startsWith: "foo",
      },
    });
  });

  it(".pathCaseInsensitive() adds path rules caseInsensitive", function () {
    fc.pathCaseInsensitive();
    expect(fc.rule).toEqual({
      path: {
        caseInsensitive: true,
      },
    });
  });

  it(".value() adds value rules", function () {
    // last .value wins
    fc.value("equals", "foo").value("equals", "bar");
    expect(fc.rule).toEqual({
      value: {
        equals: "bar",
      },
    });
  });

  it('.value("abc", "equals", 123) adds key (valueField) rules', function () {
    // last .value wins
    fc.value("abc", "equals", 123);
    expect(fc.rule).toEqual({
      valueField: {
        abc: {
          equals: 123,
        },
      },
    });
  });

  it(".key() adds key (valueField) rules", function () {
    fc.key("abc", "equals", "foo").value("def", "lessThan", 3);
    expect(fc.rule).toEqual({
      valueField: {
        abc: {
          equals: "foo",
        },
        def: {
          lessThan: 3,
        },
      },
    });
  });

  it(".sortByPath() adds sort.byPath rules", function () {
    fc.sortByPath().sortByPath();
    expect(fc.rule).toEqual({
      sort: {
        asArray: true,
        byPath: true,
      },
    });
  });

  it(".sortByValue() adds sort.byValue rules", function () {
    fc.sortByValue("number").sortByValue("number");
    expect(fc.rule).toEqual({
      sort: {
        asArray: true,
        byValue: "number",
      },
    });
  });

  it('.sortByValue("abc", "string") adds sort.byValueField rules', function () {
    fc.sortByValue("abc", "string");
    expect(fc.rule).toEqual({
      sort: {
        asArray: true,
        byValueField: {
          abc: "string",
        },
      },
    });
  });

  it(".sortByKey() adds sort by key (sort.byValueField) rules", function () {
    fc.sortByKey("score", "number").sortByKey("score", "number");
    expect(fc.rule).toEqual({
      sort: {
        asArray: true,
        byValueField: {
          score: "number",
        },
      },
    });
  });

  it(".range() adds sort from/to rules", function () {
    fc.range(1, 10).range(4, 8);
    expect(fc.rule).toEqual({
      sort: {
        asArray: true,
        from: 4,
        to: 8,
      },
    });
  });

  it(".descending() adds sort descending true rules", function () {
    fc.ascending().descending();
    expect(fc.rule).toEqual({
      sort: {
        asArray: true,
        descending: true,
      },
    });
  });

  it(".ascending() adds sort false rules", function () {
    fc.ascending();
    expect(fc.rule).toEqual({
      sort: {
        asArray: true,
        descending: false,
      },
    });
  });

  it(".differential() adds sort asArray = false rules", function () {
    fc.differential().differential();
    expect(fc.rule).toEqual({
      sort: {
        asArray: false,
      },
    });
  });
});
