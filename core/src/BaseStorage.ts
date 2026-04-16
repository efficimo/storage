import { JsonSerializeObservableValue, type SafeParseSchema } from "@efficimo/observable";
import { StorageObservable } from "./StorageObservable";

const createObservable = <StorageKey extends string>(
  storage: Storage,
  key: StorageKey,
  initialValue?: string | null,
): StorageObservable<StorageKey> => {
  const obs = new StorageObservable<StorageKey>(key, storage);

  if (obs.getValue() === null && initialValue != null) {
    obs.next(initialValue);
  }

  return obs;
};

export class BaseStorage<StorageKey extends string> {
  #storage: Storage;
  #observables: {
    [key in StorageKey]?: StorageObservable<StorageKey>;
  };

  public constructor(storage: Storage) {
    this.#observables = {};
    this.#storage = storage;

    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.storageArea === this.#storage) {
          if (null === event.key) {
            for (const observable of Object.values(this.#observables)) {
              (observable as StorageObservable<StorageKey>).next(null);
            }
            this.#observables = {};
          } else {
            const observable = this.#observables[event.key as StorageKey];
            observable?.next(event.newValue);
          }
        }
      });
    }
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
    for (let i = 0; i < this.#storage.length; i++) {
      if (this.#storage.key(i) === storageKey) {
        return true;
      }
    }

    return false;
  }

  public remove<StorageKeyParam extends StorageKey>(storageKey: StorageKeyParam): void {
    this.getObservable(storageKey).next(null);
  }

  public clear(): void {
    this.#storage.clear();
    this.#observables = {};
  }
}
