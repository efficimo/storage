import { BaseStorage } from "./BaseStorage";
import type { DefaultLocalStorageKeys } from "./DefaultLocalStorageKeys";

class _LocalStorage extends BaseStorage<keyof DefaultLocalStorageKeys & string> {
  static _instance: _LocalStorage | null = null;

  static getInstance(): _LocalStorage {
    if (_LocalStorage._instance == null) {
      _LocalStorage._instance = new _LocalStorage(localStorage);
    }

    return _LocalStorage._instance;
  }
}

export const LocalStorage = _LocalStorage.getInstance();
