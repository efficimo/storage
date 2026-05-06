import type { Store } from "./Store";

export class NativeStorageAdapter implements Store {
  readonly #storage: Storage;
  #onExternalChangeHandler: ((key: string | null, value: string | null) => void) | null = null;

  constructor(storage: Storage) {
    this.#storage = storage;
  }

  getItem(key: string): string | null {
    return this.#storage.getItem(key);
  }

  setItem(key: string, value: string): void {
    this.#storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.#storage.removeItem(key);
  }

  has(key: string): boolean {
    return this.#storage.getItem(key) !== null;
  }

  clear(): void {
    this.#storage.clear();
  }

  init(): void {
    if (typeof window === "undefined") return;
    window.addEventListener("storage", (event) => {
      if (event.storageArea !== this.#storage) return;
      this.#onExternalChangeHandler?.(event.key, event.newValue);
    });
  }

  onExternalChange = (handler: (key: string | null, value: string | null) => void): void => {
    this.#onExternalChangeHandler = handler;
  };
}
