import { ParamType, ValueType } from "../element";
import { EventType } from "../fetcher";
import { FakeFetcher, Fetcher as FetcherFunction } from "./fetch";
import JsonRPC from "./jsonrpc";

const defaultSort = () => ({
  asArray: true,
});
export type dataCallback = (data: any) => void;
export interface FetchRule {
  id?: string;
  path?: string | object;
  valueField?: any;
  value?: ValueType;
  sort?: {
    asArray?: boolean;
    descending?: boolean;
    byPath?: boolean;
    byValueField?: boolean;
    byValue?: boolean;
    from?: number;
    to?: number;
  };
}

class FetchChainer {
  rule: FetchRule = {};
  _stopped = false;
  _dataDispatcher!: dataCallback;
  _fetcher!: FakeFetcher | FetcherFunction;
  variant!: string;
  jsonrpc!: JsonRPC;
  on = (event: EventType, cb: dataCallback) => {
    if (event === "data") {
      this._dataDispatcher = cb;
      return this;
    } else {
      throw new Error("invalid event");
    }
  };
  fetch = () => {
    if (this._stopped) {
      return Promise.resolve();
    }
    if (!this._fetcher) {
      if (this.variant === "simple") {
        this._fetcher = new FakeFetcher(
          this.jsonrpc,
          this.rule,
          this._dataDispatcher,
          asNotification
        );
      } else {
        this._fetcher = new FetcherFunction(
          this.jsonrpc,
          this.rule,
          this._dataDispatcher,
          asNotification
        );
      }
    }
    return this._fetcher.fetch();
  };
  unfetch = () => {
    if (this._fetcher) {
      return this._fetcher.unfetch();
    } else {
      this._stopped = true;
      return Promise.resolve();
    }
  };
  isFetching = () => {
    if (this._fetcher) {
      return this._fetcher.isFetching();
    } else {
      return false;
    }
  };
  all = () => this;
  expression = (expression: FetchRule) => {
    this.rule = expression;
    return this;
  };
  path = (match: string, comp: any) => {
    this.rule.path = this.rule.path || {};
    this.rule.path[match] = comp;
    return this;
  };
  pathCaseInsensitive = () => {
    this.rule.path = this.rule.path || {};
    this.rule.path.caseInsensitive = true;
    return this;
  };
  key = (key: string | number, match: string | number, comp: any) => {
    this.rule.valueField = this.rule.valueField || {};
    this.rule.valueField[key] = {};
    this.rule.valueField[key][match] = comp;
    return this;
  };
  //TODO value = (arg1,arg2,...rest)
  value = (...args: ValueType[]) => {
    if (args.length === 2) {
      const match = args[0];
      const comp = args[1];
      this.rule.value = this.rule.value || {};
      this.rule.value[match] = comp;
      return this;
    } else {
      return this.key(args[0], args[1], args[2]);
    }
  };

  _sortObject = () => {
    this.rule.sort = this.rule.sort || defaultSort();
    return this.rule.sort;
  };
  differential = () => {
    this._sortObject().asArray = false;
    return this;
  };
  ascending = () => {
    this._sortObject().descending = false;
    return this;
  };
  descending = () => {
    this._sortObject().descending = true;
    return this;
  };
  sortByPath = () => {
    this._sortObject().byPath = true;
    return this;
  };
  sortByKey = (key: string | number, type: any) => {
    const sort = this._sortObject();
    sort.byValueField = {};
    sort.byValueField[key] = type;
    return this;
  };
  sortByValue = (...args: ValueType[]) => {
    const sort = this._sortObject();
    if (args.length === 1) {
      sort.byValue = args[0];
    } else {
      return this.sortByKey(args[0], args[1]);
    }
    return this;
  };
  range = (from: number, to: number) => {
    const sort = this._sortObject();
    sort.from = from;
    sort.to = to || from + 20;
    return this;
  };
}
export const Fetcher = FetchChainer;

export default FetchChainer;