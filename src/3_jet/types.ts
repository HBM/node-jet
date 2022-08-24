"use strict";
export const events = [
  "configure",
  "info",
  "fetch",
  "unfetch",
  "remove",
  "change",
  "add",
  "data",
  "call",
  "get",
  "set",
] as const;
export type EventType = typeof events[number];

export const pathRules = [
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
] as const;
export type PathRule = typeof pathRules[number];
export type sortable = "boolean" | "number" | "string";

export const valueRules = [
  "greaterThan",
  "lessThan",
  "equals",
  "equalsNot",
  "isType",
] as const;
export type ValueRule = typeof valueRules[number];
export interface AccessType {
  id?: string;
}
export type ValueType = string | number | object | boolean;

export const fetchSimpleId = "fetch_all";
