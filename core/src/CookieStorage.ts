import { BaseStorage } from "./BaseStorage";
import { type CookieOptions, CookieStorageAdapter } from "./CookieStorageAdapter";
import type { DefaultCookieStorageKeys } from "./DefaultCookieStorageKeys";

export type { CookieOptions };

class _CookieStorage extends BaseStorage<keyof DefaultCookieStorageKeys & string, CookieOptions> {
  static _instance: _CookieStorage | null = null;

  static getInstance(): _CookieStorage {
    if (_CookieStorage._instance == null) {
      _CookieStorage._instance = new _CookieStorage(new CookieStorageAdapter());
    }

    return _CookieStorage._instance;
  }
}

export const CookieStorage = _CookieStorage.getInstance();
