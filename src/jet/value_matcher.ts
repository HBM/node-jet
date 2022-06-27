import { accessField, eachKeyValue, invalidParams, isDefined } from "./utils";

const generators: Record<string, (other: any) => (x: any) => boolean> = {
  lessThan: (other: number) => (x: number) => x < other,
  greaterThan: (other: number) => (x: number) => x > other,
  equals: (other: any) => (x: any) => x === other,
  equalsNot: (other: any) => (x: any) => x !== other,
  isType: (type: string) => (x: any) => typeof x === type,
};

const generatePredicate = (op: string, val: any) => {
  const gen = generators[op];
  if (!gen) {
    throw invalidParams("unknown generator " + op);
  } else {
    return gen(val);
  }
};

const createValuePredicates = (valueOptions: Record<any, any>) => {
  const predicates: any[] = [];
  eachKeyValue(valueOptions)((op, val) => {
    predicates.push(generatePredicate(op, val));
  });
  return predicates;
};

const createValueFieldPredicates = (valueFieldOptions: Record<any, any>) => {
  const predicates: any[] = [];
  eachKeyValue(valueFieldOptions)((fieldStr, rule) => {
    const fieldPredicates: any[] = [];
    const accessor = accessField(fieldStr);
    eachKeyValue(rule)((op, val) => {
      fieldPredicates.push(generatePredicate(op, val));
    });
    const fieldPredicate = (value: any) => {
      if (typeof value !== "object") {
        return false;
      }
      try {
        const field = accessor(value);
        for (let i = 0; i < fieldPredicates.length; ++i) {
          if (!fieldPredicates[i](field)) {
            return false;
          }
        }
        return true;
      } catch (e) {
        return false;
      }
    };
    predicates.push(fieldPredicate);
  });

  return predicates;
};

export const create = (options: any) => {
  // sorting by value implicitly defines value matcher rule against expected type
  if (options.sort) {
    if (options.sort.byValue) {
      options.value = options.value || {};
      options.value.isType = options.sort.byValue;
    } else if (options.sort.byValueField) {
      const fieldName = Object.keys(options.sort.byValueField)[0];
      const type = options.sort.byValueField[fieldName];
      options.valueField = options.valueField || {};
      options.valueField[fieldName] = options.valueField[fieldName] || {};
      options.valueField[fieldName].isType = type;
    }
  }

  if (!isDefined(options.value) && !isDefined(options.valueField)) {
    return;
  }

  let predicates: string | any[];

  if (isDefined(options.value)) {
    predicates = createValuePredicates(options.value);
  } else if (isDefined(options.valueField)) {
    predicates = createValueFieldPredicates(options.valueField);
  }

  return (value: any) => {
    // eslint-disable-line consistent-return
    try {
      for (let i = 0; i < predicates.length; ++i) {
        if (!predicates[i](value)) {
          return false;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  };
};
