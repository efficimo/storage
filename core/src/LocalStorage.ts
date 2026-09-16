import { BaseStorage } from "./BaseStorage.ts";
import type { DefaultLocalStorageKeys } from "./DefaultLocalStorageKeys.ts";
import { NativeStorageAdapter } from "./NativeStorageAdapter.ts";

class _LocalStorage extends BaseStorage<keyof DefaultLocalStorageKeys & string> {
  static _instance: _LocalStorage | null = null;

  static getInstance(): _LocalStorage {
    if (_LocalStorage._instance == null) {
      _LocalStorage._instance = new _LocalStorage(new NativeStorageAdapter(localStorage));
    }

    return _LocalStorage._instance;
  }
}

export const LocalStorage = _LocalStorage.getInstance();
