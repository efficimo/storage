import { BaseStorage } from "./BaseStorage";
import type { DefaultSessionStorageKeys } from "./DefaultSessionStorageKeys";

class _SessionStorage extends BaseStorage<keyof DefaultSessionStorageKeys & string> {
  static _instance: _SessionStorage | null = null;

  static getInstance(): _SessionStorage {
    if (_SessionStorage._instance == null) {
      _SessionStorage._instance = new _SessionStorage(sessionStorage);
    }

    return _SessionStorage._instance;
  }
}

export const SessionStorage = _SessionStorage.getInstance();
