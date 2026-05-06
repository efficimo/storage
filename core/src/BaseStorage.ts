import { JsonSerializeObservableValue, type SafeParseSchema } from "@efficimo/observable";
import { StorageObservable } from "./StorageObservable";
import type { Store } from "./Store";

const createObservable = <StorageKey extends string, Options>(
  storage: Store<StorageKey, Options>,
  key: StorageKey,
  initialValue?: string | null,
): StorageObservable<StorageKey> => {
  const obs = new StorageObservable<StorageKey>(key, storage);

  if (obs.getValue() === null && initialValue != null) {
    obs.next(initialValue);
  }

  return obs;
};

export class BaseStorage<StorageKey extends string, Options = never> {
  #storage: Store<StorageKey, Options>;
  #observables: {
    [key in StorageKey]?: StorageObservable<StorageKey>;
  };

  public constructor(storage: Store<StorageKey, Options>) {
    this.#observables = {};
    this.#storage = storage;

    storage.onExternalChange?.((key, value) => {
      if (key === null) {
        for (const observable of Object.values(this.#observables)) {
          (observable as StorageObservable<StorageKey>).next(null);
        }
        this.#observables = {};
      } else {
        this.#observables[key as StorageKey]?.next(value);
      }
    });

    storage.init();
  }

  public getObservable<StorageKeyParam extends StorageKey>(
    storageKey: StorageKeyParam,
    defaultValue?: string | null,
  ): StorageObservable<StorageKey> {
    if (this.#observables[storageKey] == null) {
      this.#observables[storageKey] = createObservable(this.#storage, storageKey, defaultValue);
    }

    return this.#observables[storageKey];
  }

  public getSerializedObservable<StorageKeyParam extends StorageKey, Value>(
    storageKey: StorageKeyParam,
    schema: SafeParseSchema<Value>,
    defaultValue?: Value,
  ): JsonSerializeObservableValue<Value> {
    return new JsonSerializeObservableValue(
      this.getObservable(storageKey, defaultValue == null ? null : JSON.stringify(defaultValue)),
      schema,
      defaultValue,
    );
  }

  public get<StorageKeyParam extends StorageKey>(
    storageKey: StorageKeyParam,
    defaultValue?: string | null,
  ): string | null {
    return this.getObservable(storageKey, defaultValue).getValue();
  }

  public set<StorageKeyParam extends StorageKey>(
    storageKey: StorageKeyParam,
    data: string | null,
  ): void {
    this.getObservable(storageKey).next(data);
  }

  public has<StorageKeyParam extends StorageKey>(storageKey: StorageKeyParam): boolean {
    return this.#storage.has(storageKey);
  }

  public remove<StorageKeyParam extends StorageKey>(storageKey: StorageKeyParam): void {
    this.getObservable(storageKey).next(null);
  }

  public clear(): void {
    this.#storage.clear();
    this.#observables = {};
  }
}
