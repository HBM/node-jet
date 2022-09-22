// import { Notification } from "./fetcher";
import { InvalidArgument } from "../errors";
import { FetchOptions } from "../messages";
import { PathRule, pathRules } from "../types";

const contains = (what: string) => (path: string) => path.indexOf(what) !== -1;

const containsAllOf = (whatArray: string[]) => {
  return (path: string) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) === -1) {
        return false;
      }
    }
    return true;
  };
};

const containsOneOf = (whatArray: string[]) => {
  return (path: string) => {
    let i;
    for (i = 0; i < whatArray.length; i = i + 1) {
      if (path.indexOf(whatArray[i]) !== -1) {
        return true;
      }
    }
    return false;
  };
};

const startsWith = (what: string) => (path: string) =>
  path.substring(0, what.length) === what;

const endsWith = (what: string) => (path: string) =>
  path.lastIndexOf(what) === path.length - what.length;

const equals = (what: string) => (path: string) => path === what;

const equalsOneOf = (whatArray: string[]) => (path: string) => {
  let i;
  for (i = 0; i < whatArray.length; i = i + 1) {
    if (path === whatArray[i]) {
      return true;
    }
  }
  return false;
};

const negate = (gen: any) => {
  return (...args: any) => {
    const f = gen.apply(undefined, args);
    return () => {
      return !f.apply(undefined, args);
    };
  };
};

const generators: Record<PathRule, any> = {
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

export const createPathMatcher = (options: FetchOptions) => {
  if (!options.path) {
    return () => true;
  }
  const po = options.path;
  Object.keys(po).forEach((key) => {
    if (!(key in generators) && key !== "caseInsensitive")
      throw new InvalidArgument("unknown rule " + key);
  });
  const predicates: ((path: string) => boolean)[] = [];
  pathRules.forEach((name) => {
    let gen;
    let option = po[name];
    if (option) {
      gen = generators[name];
      if (po.caseInsensitive) {
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

  return predicates.length === 1
    ? (path: string) => predicates[0](path)
    : (path: string) => applyPredicates(path);
};
