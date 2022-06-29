// @ts-nocheck
import { FakeFetcher, Fetcher } from "./fetch";

const defaultSort = () => ({
  asArray: true,
});

export class FetchChainer {
  rule: {
    path?: { caseInsensitive?: Boolean };
    valueField?: Object;
    value?: Object;
    sort?: {
      asArray?: Boolean;
      descending?: Boolean;
      byPath?: Boolean;
      byValueField?: Object;
      byValue?: Boolean;
      from?: Object;
      to?: Object;
    };
  } = {};
  _stopped = false;
  _dataDispatcher;
  _fetcher;
  variant;
  jsonrpc;
  on = (event, cb) => {
    if (event === "data") {
      this._dataDispatcher = cb;
      return this;
    } else {
      throw new Error("invalid event");
    }
  };
  fetch = (asNotification) => {
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
        this._fetcher = new Fetcher(
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
  expression = (expression) => {
    this.rule = expression;
    return this;
  };
  path = (match, comp) => {
    this.rule.path = this.rule.path || {};
    this.rule.path[match] = comp;
    return this;
  };
  pathCaseInsensitive = () => {
    this.rule.path = this.rule.path || {};
    this.rule.path.caseInsensitive = true;
    return this;
  };
  key = (key, match, comp) => {
    this.rule.valueField = this.rule.valueField || {};
    this.rule.valueField[key] = {};
    this.rule.valueField[key][match] = comp;
    return this;
  };
  //TODO value = (arg1,arg2,...rest)
  value = (...args) => {
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
  sortByKey = (key, type) => {
    const sort = this._sortObject();
    sort.byValueField = {};
    sort.byValueField[key] = type;
    return this;
  };
  sortByValue = (...args) => {
    const sort = this._sortObject();
    if (args.length === 1) {
      sort.byValue = args[0];
    } else {
      return this.sortByKey(args[0], args[1]);
    }
    return this;
  };
  range = (from, to) => {
    const sort = this._sortObject();
    sort.from = from;
    sort.to = to || from + 20;
    return this;
  };
}

export default FetchChainer;
