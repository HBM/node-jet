import { invalidParams } from "../errors";
import { ValueType } from "../types";
import { accessField, isDefined } from "../utils";

type compareFunction = (x: ValueType) => boolean;
type generatorFunction = (other: string | ValueType) => compareFunction;

const generators: Record<string, generatorFunction> = {
  equals: (other) => (x) => x === other,
  lessThan: (other) => (x) => x < other,
  equalsNot: (other) => (x) => x !== other,
  greaterThan: (other) => (x) => x > other,
  isType: (other) => (x) => typeof x === other,
};

const generatePredicate = (op: string, val: ValueType): compareFunction => {
  const gen = generators[op];
  if (!gen) {
    throw invalidParams("unknown generator " + op);
  } else {
    return gen(val);
  }
};

const createValuePredicates = (valueOptions: Record<string, ValueType>) => {
  const predicates: compareFunction[] = [];
  Object.entries(valueOptions).forEach(([op, val]) => {
    predicates.push(generatePredicate(op, val));
  });
  return predicates;
};

const createValueFieldPredicates = (
  valueFieldOptions: Record<string, Record<string, ValueType>>
) => {
  const predicates: any[] = [];
  Object.entries(valueFieldOptions).forEach(([fieldStr, rule]) => {
    const fieldPredicates: any[] = [];
    const accessor = accessField(fieldStr);
    Object.entries(rule).forEach(([op, val]) => {
      fieldPredicates.push(generatePredicate(op, val));
    });
    const fieldPredicate = (value: ValueType) => {
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
    return (value: ValueType | undefined) => !!value;
  }

  let predicates: string | any[];

  if (isDefined(options.value)) {
    predicates = createValuePredicates(options.value);
  } else if (isDefined(options.valueField)) {
    predicates = createValueFieldPredicates(options.valueField);
  }

  return (value: ValueType | undefined) => {
    if (!value) return false;
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
