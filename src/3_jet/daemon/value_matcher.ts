import { invalidParams } from "../errors";
import { ValueRule, ValueType } from "../types";
import { getValue } from "../utils";

type compareFunction = (x: ValueType) => boolean;
type generatorFunction = (
  field: string,
  other: string | ValueType
) => compareFunction;

const generators: Record<string, generatorFunction> = {
  equals: (field, other) => (x) => getValue(x, field) === other,
  lessThan: (field, other) => (x) => getValue(x, field) < other,
  equalsNot: (field, other) => (x) => getValue(x, field) !== other,
  greaterThan: (field, other) => (x) => getValue(x, field) > other,
  isType: (field, other) => (x) => typeof getValue(x, field) === other,
};

const generatePredicate = (field: string, rule: ValueRule): compareFunction => {
  const gen = generators[rule.operator];
  if (!gen) {
    throw invalidParams("unknown generator " + rule.operator);
  } else {
    return gen(field, rule.value);
  }
};

const createValuePredicates = (valueOptions: Record<string, ValueRule>) => {
  const predicates: compareFunction[] = [];
  Object.entries(valueOptions).forEach(([field, rule]) => {
    predicates.push(generatePredicate(field, rule));
  });
  return predicates;
};

export const create = (options: any) => {
  if (options.value) {
    const predicates = createValuePredicates(options.value);
    return (value: ValueType | undefined) => {
      if (value === undefined) return false;
      // eslint-disable-line consistent-return
      for (let i = 0; i < predicates.length; ++i) {
        if (!predicates[i](value)) {
          return false;
        }
      }
      return true;
    };
  }
  return () => true;
};
