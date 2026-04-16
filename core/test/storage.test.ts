import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BaseStorage } from "../src/BaseStorage";
import { StorageObservable } from "../src/StorageObservable";

class MockStorage implements Storage {
  private data: Record<string, string> = {};

  get length() {
    return Object.keys(this.data).length;
  }

  clear() {
    this.data = {};
  }

  getItem(key: string): string | null {
    return Object.hasOwn(this.data, key) ? this.data[key] : null;
  }

  key(index: number): string | null {
    return Object.keys(this.data)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }
}

describe("StorageObservable", () => {
  it("returns null for an unset key", () => {
    const mock = new MockStorage();
    const obs = new StorageObservable("foo", mock);
    assert.equal(obs.getValue(), null);
  });

  it("emits current value on subscribe", () => {
    const mock = new MockStorage();
    mock.setItem("foo", "bar");
    const obs = new StorageObservable("foo", mock);

    const values: (string | null)[] = [];
    obs.subscribe((v) => values.push(v));
    assert.deepEqual(values, ["bar"]);
  });

  it("sets and emits new value", async () => {
    const mock = new MockStorage();
    const obs = new StorageObservable("foo", mock);

    const values: (string | null)[] = [];
    obs.subscribe((v) => values.push(v));

    await obs.next("hello");
    assert.deepEqual(values, [null, "hello"]);
    assert.equal(mock.getItem("foo"), "hello");
  });

  it("removes item when set to null", async () => {
    const mock = new MockStorage();
    mock.setItem("foo", "bar");
    const obs = new StorageObservable("foo", mock);

    await obs.next(null);
    assert.equal(mock.getItem("foo"), null);
  });

  it("skips notification when value is unchanged", async () => {
    const mock = new MockStorage();
    mock.setItem("foo", "bar");
    const obs = new StorageObservable("foo", mock);

    const values: (string | null)[] = [];
    obs.subscribe((v) => values.push(v));
    await obs.next("bar");

    assert.deepEqual(values, ["bar"]);
  });

  it("supports setter function", async () => {
    const mock = new MockStorage();
    mock.setItem("count", "2");
    const obs = new StorageObservable("count", mock);

    await obs.next((prev) => String(Number(prev ?? "0") + 1));
    assert.equal(mock.getItem("count"), "3");
  });
});

describe("BaseStorage", () => {
  it("returns the same observable for the same key", () => {
    const mock = new MockStorage();
    const store = new BaseStorage(mock);
    const obs1 = store.getObservable("key");
    const obs2 = store.getObservable("key");
    assert.strictEqual(obs1, obs2);
  });

  it("get returns null for unset key", () => {
    const mock = new MockStorage();
    const store = new BaseStorage(mock);
    assert.equal(store.get("missing"), null);
  });

  it("set then get returns the value", () => {
    const mock = new MockStorage();
    const store = new BaseStorage(mock);
    store.set("token", "abc123");
    assert.equal(store.get("token"), "abc123");
  });

  it("has returns false for missing key", () => {
    const mock = new MockStorage();
    const store = new BaseStorage(mock);
    assert.equal(store.has("x"), false);
  });

  it("has returns true after set", () => {
    const mock = new MockStorage();
    const store = new BaseStorage(mock);
    store.set("x", "1");
    assert.equal(store.has("x"), true);
  });

  it("remove sets value to null", async () => {
    const mock = new MockStorage();
    const store = new BaseStorage(mock);
    store.set("x", "1");
    store.remove("x");
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(store.get("x"), null);
  });

  it("clear empties the store", () => {
    const mock = new MockStorage();
    const store = new BaseStorage(mock);
    store.set("a", "1");
    store.set("b", "2");
    store.clear();
    assert.equal(store.get("a"), null);
    assert.equal(store.get("b"), null);
  });

  it("getSerializedObservable parses JSON with schema", async () => {
    const mock = new MockStorage();
    const store = new BaseStorage(mock);

    const schema = {
      safeParse: (data: unknown) => {
        if (typeof data === "number") return { data };
        const n = Number(data);
        return Number.isNaN(n) ? {} : { data: n };
      },
    };

    const obs = store.getSerializedObservable("count", schema, 0);
    assert.equal(obs.getValue(), 0);

    await obs.next(42);
    assert.equal(mock.getItem("count"), "42");
    assert.equal(obs.getValue(), 42);
  });
});
