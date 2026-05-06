export interface Store<StorageKey extends string = string, Options = void> {
  getItem(key: StorageKey, options?: Options): string | null;
  setItem(key: StorageKey, value: string, options?: Options): void;
  removeItem(key: StorageKey): void;
  has(key: StorageKey): boolean;
  clear(): void;
  init(): void;
  onExternalChange?: (handler: (key: string | null, value: string | null) => void) => void;
}
