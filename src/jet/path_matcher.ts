// import { Notification } from "./fetcher";
import { isDefined } from "./utils";

const contains = (what: string) => {
  return (path: string) => {
    return path.indexOf(what) !== -1;
  };
};

const containsAllOf = (whatArray: string | string[]) => {
  return (path: string | string[]) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) === -1) {
        return false;
      }
    }
    return true;
  };
};

const containsOneOf = (whatArray: string | string[]) => {
  return (path: string | string[]) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) !== -1) {
        return true;
      }
    }
    return false;
  };
};

const startsWith = (what: string) => {
  return (path: string) => {
    return path.substring(0, what.length) === what;
  };
};

const endsWith = (what: string) => {
  return (path: string) => {
    return path.lastIndexOf(what) === path.length - what.length;
  };
};

const equals = (what: any) => {
  return (path: any) => {
    return path === what;
  };
};

const equalsOneOf = (whatArray: string | string[]) => {
  return (path: string) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path === whatArray[i]) {
        return true;
      }
    }
    return false;
  };
};

const negate = (gen: any) => {
  return (...args: any) => {
    const f = gen.apply(undefined, args);
    return () => {
      return !f.apply(undefined, args);
    };
  };
};

const generators: Record<any, any> = {
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

export const create = (options: any) => {
  if (!isDefined(options.path)) {
    return;
  }
  const po = options.path;
  const ci = po.caseInsensitive;
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

  const applyPredicates = (path: string) => {
    for (let i = 0; i < predicates.length; ++i) {
      if (!predicates[i](path)) {
        return false;
      }
    }
    return true;
  };

  const pathMatcher =
    predicates.length === 1
      ? (path: any, _lowerPath: any) => predicates[0](path)
      : (path: any, _lowerPath: any) => applyPredicates(path);

  return pathMatcher; // eslint-disable-line consistent-return
};
