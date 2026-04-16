# @efficimo/storage

[![npm version](https://img.shields.io/npm/v/@efficimo/storage)](https://www.npmjs.com/package/@efficimo/storage)
[![npm version](https://img.shields.io/npm/v/@efficimo/storage-react?label=%40efficimo%2Fstorage-react)](https://www.npmjs.com/package/@efficimo/storage-react)
[![license](https://img.shields.io/npm/l/@efficimo/storage)](./LICENSE)
[![types](https://img.shields.io/npm/types/@efficimo/storage)](https://www.npmjs.com/package/@efficimo/storage)

> Subscribe to browser storage. Typed keys, reactive updates, cross-tab sync — no boilerplate.

Built on [`@efficimo/observable`](https://www.npmjs.com/package/@efficimo/observable). Zero additional dependencies.

## Packages

| Package | Description |
|---|---|
| [`@efficimo/storage`](./core) | Core — framework-agnostic |
| [`@efficimo/storage-react`](./react) | React bindings — `useStorageObservable` hook |

## Installation

```bash
# core only
npm install @efficimo/observable @efficimo/storage

# with React hook
npm install @efficimo/observable @efficimo/storage @efficimo/storage-react
```

## Quick start

```typescript
import { BaseStorage } from '@efficimo/storage';

type Keys = 'auth.token' | 'user.theme';
const store = new BaseStorage<Keys>(localStorage);

// reactive subscription
store.getObservable('auth.token').subscribe(token => {
  console.log('token changed:', token);
});

// set / get / remove
store.set('auth.token', 'abc123');
store.get('auth.token'); // 'abc123'
store.remove('auth.token');
```

## Typed keys via module augmentation

Extend `DefaultLocalStorageKeys` or `DefaultSessionStorageKeys` to get typed keys on the `LocalStorage` and `SessionStorage` singletons:

```typescript
// storage-keys.d.ts
import '@efficimo/storage';

declare module '@efficimo/storage' {
  interface DefaultLocalStorageKeys {
    'auth.token': true;
    'user.theme': true;
  }
  interface DefaultSessionStorageKeys {
    'wizard.step': true;
  }
}
```

```typescript
import { LocalStorage, SessionStorage } from '@efficimo/storage';

LocalStorage.set('auth.token', 'abc123');   // typed ✓
LocalStorage.set('unknown.key', 'value');   // TS error ✓
```

## JSON serialization

`getSerializedObservable` accepts any schema with a `safeParse` method (Zod, Valibot, etc.):

```typescript
import { z } from 'zod';
import { LocalStorage } from '@efficimo/storage';

declare module '@efficimo/storage' {
  interface DefaultLocalStorageKeys {
    'user.prefs': true;
  }
}

const schema = z.object({ theme: z.enum(['light', 'dark']), lang: z.string() });
const prefs = LocalStorage.getSerializedObservable('user.prefs', schema, { theme: 'light', lang: 'en' });

prefs.subscribe(v => console.log(v)); // { theme: 'light', lang: 'en' }

await prefs.next({ theme: 'dark', lang: 'fr' });
// localStorage now holds '{"theme":"dark","lang":"fr"}'
```

## Cross-tab sync

`BaseStorage` listens to the browser `storage` event automatically. Any change made in another tab propagates to all active observables in the current tab — no extra setup required.

## API

### `BaseStorage<StorageKey>`

| Method | Description |
|---|---|
| `getObservable(key, defaultValue?)` | Returns (or creates) a `StorageObservable` for the given key. |
| `getSerializedObservable(key, schema, defaultValue?)` | Returns a `JsonSerializeObservableValue` backed by the storage key. |
| `get(key, defaultValue?)` | Returns the current string value. |
| `set(key, value)` | Sets the value. |
| `has(key)` | Returns `true` if the key exists in storage. |
| `remove(key)` | Removes the key (sets to `null`). |
| `clear()` | Clears all keys from storage. |

### `StorageObservable<StorageKey>`

Implements `ObservableValueInterface<string | null>` from `@efficimo/observable`.

| Member | Description |
|---|---|
| `getValue()` | Returns the current storage value. |
| `subscribe(fn)` | Registers subscriber and immediately calls it with the current value. |
| `next(value \| setter)` | Updates the value. Supports async setter `(prev) => newValue`. No-op if unchanged. |

---

## React bindings — `@efficimo/storage-react`

### `useStorageObservable`

Subscribe to a raw `string | null` storage value.

```typescript
import { LocalStorage } from '@efficimo/storage';
import { useStorageObservable } from '@efficimo/storage-react';

function AuthStatus() {
  const [token, setToken] = useStorageObservable(LocalStorage.getObservable('auth.token'));

  return token
    ? <button onClick={() => setToken(null)}>Logout</button>
    : <span>Not logged in</span>;
}
```

### `useStorageSerializedObservable`

Subscribe to a JSON-serialized storage value. Returns a typed `[T | null, setter]` tuple — no manual parsing needed.

```typescript
import { z } from 'zod';
import { LocalStorage } from '@efficimo/storage';
import { useStorageSerializedObservable } from '@efficimo/storage-react';

const prefsObs = LocalStorage.getSerializedObservable(
  'user.prefs',
  z.object({ theme: z.enum(['light', 'dark']), lang: z.string() }),
  { theme: 'light', lang: 'en' },
);

function ThemeToggle() {
  const [prefs, setPrefs] = useStorageSerializedObservable(prefsObs);

  return (
    <button onClick={() => setPrefs({ ...prefs, theme: prefs?.theme === 'light' ? 'dark' : 'light' })}>
      {prefs?.theme ?? 'light'}
    </button>
  );
}
```

Both hooks re-render the component whenever the storage value changes — including updates from other components or cross-tab events.

---

## License

MIT
