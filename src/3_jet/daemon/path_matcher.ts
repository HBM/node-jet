// import { Notification } from "./fetcher";
import { FetchOptions } from "../messages";
import { pathRules } from "../types";
import { isDefined } from "../utils";

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

const equalsOneOf = (whatArray: string | string[]) => (path: string) => {
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



export const createPathMatcher = (options: FetchOptions) => {
  if (!isDefined(options.path)) {
    return () => true;
  }
  const po = options.path;
  const predicates: ((path: string) => boolean)[] = [];
  pathRules.forEach((name) => {
    let gen;
    let option = po[name];
    if (isDefined(option)) {
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
