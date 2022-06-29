// @ts-nocheck
import assert from "assert";
import { FetchChainer } from "../browser";

export const changesTo = (peer, path, value, done) => {
  const fetcher = new FetchChainer().path("equals", path).on("data", (data) => {
    if (data.event !== "change") {
      return;
    }
    assert.deepEqual(data.value, value);
    fetcher
      .unfetch()
      .then(() => {
        done();
      })
      .catch(done);
  });
  peer.fetch(fetcher);
};
export const getsRemoved = (peer, path, done) => {
  const fetcher = new FetchChainer().path("equals", path).on("data", (data) => {
    if (data.event !== "remove") {
      return;
    }
    fetcher
      .unfetch()
      .then(() => {
        done();
      })
      .catch(done);
  });
  peer.fetch(fetcher);
};
export const isState = (peer, path, value, done) => {
  if (!done) {
    done = value;
    value = undefined;
  }
  const fetcher = new FetchChainer().path("equals", path).on("data", (data) => {
    assert.equal(data.event, "add");
    assert.equal(data.path, path);
    if (typeof value !== "undefined") {
      assert.deepEqual(data.value, value);
    } else {
      assert(typeof data.value !== "undefined");
    }
    fetcher
      .unfetch()
      .then(() => {
        done();
      })
      .catch(done);
  });
  peer.fetch(fetcher);
};
export const isMethod = (peer, path, done) => {
  const fetcher = new FetchChainer().path("equals", path).on("data", (data) => {
    assert.equal(data.event, "add");
    assert.equal(data.path, path);
    assert(typeof data.value === "undefined");
    fetcher
      .unfetch()
      .then(() => {
        done();
      })
      .catch(done);
  });
  peer.fetch(fetcher);
};
