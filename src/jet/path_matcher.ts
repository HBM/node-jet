
// @ts-nocheck
import { isDefined } from "./utils";

const contains = (what) => {
  return (path) => {
    return path.indexOf(what) !== -1;
  };
};

const containsAllOf = (whatArray) => {
  return (path) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) === -1) {
        return false;
      }
    }
    return true;
  };
};

const containsOneOf = (whatArray) => {
  return (path) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) !== -1) {
        return true;
      }
    }
    return false;
  };
};

const startsWith = (what) => {
  return (path) => {
    return path.substr(0, what.length) === what;
  };
};

const endsWith = (what) => {
  return (path) => {
    return path.lastIndexOf(what) === path.length - what.length;
  };
};

const equals = (what) => {
  return (path) => {
    return path === what;
  };
};

const equalsOneOf = (whatArray) => {
  return (path) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path === whatArray[i]) {
        return true;
      }
    }
    return false;
  };
};

const negate = (gen) => {
  return (...args) => {
    const f = gen.apply(undefined, args);
    return () => {
      return !f.apply(undefined, args);
    };
  };
};

const generators = {
  equals: equals,
  equalsNot: negate(equals),
  contains: contains,
  containsNot: negate(contains),
  containsAllOf: containsAllOf,
  containsOneOf: containsOneOf,
  startsWith: startsWith,
  startsNotWith: negate(startsWith),
  endsWith: endsWith,
  endsNotWith: negate(endsWith),
  equalsOneOf: equalsOneOf,
  equalsNotOneOf: negate(equalsOneOf),
};

const predicateOrder = [
  "equals",
  "equalsNot",
  "endsWith",
  "startsWith",
  "contains",
  "containsNot",
  "containsAllOf",
  "containsOneOf",
  "startsNotWith",
  "endsNotWith",
  "equalsOneOf",
  "equalsNotOneOf",
];

export const create = (options) => {
  if (!isDefined(options.path)) {
    return;
  }
  const po = options.path;
  const ci = po.caseInsensitive;
  let pred;
  const predicates: any[] = [];

  predicateOrder.forEach((name) => {
    let gen;
    let option = po[name];
    if (isDefined(option)) {
      gen = generators[name];
      if (ci) {
        if (Array.isArray(option)) {
          option = option.map((op) => op.toLowerCase());
        } else {
          option = option.toLowerCase();
        }
      }
      predicates.push(gen(option));
    }
  });

  const applyPredicates = (path) => {
    for (let i = 0; i < predicates.length; ++i) {
      if (!predicates[i](path)) {
        return false;
      }
    }
    return true;
  };

  let pathMatcher;

  if (ci) {
    if (predicates.length === 1) {
      pred = predicates[0];
      pathMatcher = (_, lowerPath) => pred(lowerPath);
    } else {
      pathMatcher = (_, lowerPath) => applyPredicates(lowerPath);
    }
  } else {
    if (predicates.length === 1) {
      pred = predicates[0];
      pathMatcher = (path) => pred(path);
    } else {
      pathMatcher = (path) => applyPredicates(path);
    }
  }

  return pathMatcher; // eslint-disable-line consistent-return
};
