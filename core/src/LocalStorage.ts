import { BaseStorage } from "./BaseStorage";
import type { DefaultLocalStorageKeys } from "./DefaultLocalStorageKeys";
import { NativeStorageAdapter } from "./NativeStorageAdapter";

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
