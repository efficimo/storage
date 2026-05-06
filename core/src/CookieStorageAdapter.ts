import type { Store } from "./Store";

export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  sameSite?: CookieSameSite;
}

export class CookieStorageAdapter implements Store<string, CookieOptions> {
  readonly #options: CookieOptions;
  #onExternalChangeHandler: ((key: string | null, value: string | null) => void) | null = null;

  constructor(options: CookieOptions = {}) {
    this.#options = options;
  }

  getItem(key: string): string | null {
    return this.#entries().find(([k]) => k === key)?.[1] ?? null;
  }

  setItem(key: string, value: string, options?: CookieOptions): void {
    this.#store()
      .set(this.#buildInit(key, value, options))
      .catch((err: unknown) => {
        throw new Error(`Failed to set cookie "${key}": ${err}`);
      });
  }

  removeItem(key: string): void {
    const opts = this.#options;
    this.#store()
      .delete({ name: key, domain: opts.domain ?? null, path: opts.path })
      .catch((err: unknown) => {
        throw new Error(`Failed to delete cookie "${key}": ${err}`);
      });
  }

  has(key: string): boolean {
    return this.getItem(key) !== null;
  }

  clear(): void {
    this.#store()
      .getAll()
      .then((cookies) => {
        for (const cookie of cookies) {
          if (cookie.name == null) continue;
          this.#store()
            .delete({
              name: cookie.name,
              domain: this.#options.domain ?? null,
              path: this.#options.path,
            })
            .catch((err: unknown) => {
              throw new Error(`Failed to delete cookie "${cookie.name}": ${err}`);
            });
        }
      })
      .catch((err: unknown) => {
        throw new Error(`Failed to clear cookies: ${err}`);
      });
  }

  init(): void {
    if (typeof window === "undefined" || !window.cookieStore) return;
    window.cookieStore.onchange = (event) => {
      for (const cookie of event.changed) {
        this.#onExternalChangeHandler?.(cookie.name ?? null, cookie.value ?? null);
      }
      for (const cookie of event.deleted) {
        this.#onExternalChangeHandler?.(cookie.name ?? null, null);
      }
    };
  }

  onExternalChange = (handler: (key: string | null, value: string | null) => void): void => {
    this.#onExternalChangeHandler = handler;
  };

  #store(): CookieStore {
    if (typeof window === "undefined" || !window.cookieStore) {
      throw new Error("cookieStore is not available in this environment");
    }
    return window.cookieStore;
  }

  #buildInit(name: string, value: string, options?: CookieOptions): CookieInit {
    const opts = { ...this.#options, ...options };
    const init: CookieInit = { name, value };
    if (opts.path != null) init.path = opts.path;
    if (opts.domain != null) init.domain = opts.domain;
    if (opts.maxAge != null) init.expires = Date.now() + opts.maxAge * 1000;
    if (opts.sameSite != null) init.sameSite = opts.sameSite;
    return init;
  }

  #entries(): [string, string][] {
    if (typeof document === "undefined" || !document.cookie) return [];
    return document.cookie
      .split("; ")
      .filter(Boolean)
      .map((c) => {
        const eq = c.indexOf("=");
        return [decodeURIComponent(c.slice(0, eq)), decodeURIComponent(c.slice(eq + 1))];
      });
  }
}
