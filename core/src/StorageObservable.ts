import {
  isSetFunction,
  Observable,
  type ObservableValueInterface,
  type SetFunction,
  type Subscriber,
} from "@efficimo/observable";
import type { Store } from "./Store";

export class StorageObservable<StorageKey extends string>
  extends Observable<string | null>
  implements ObservableValueInterface<string | null>
{
  private key: StorageKey;
  private storage: Store<StorageKey, unknown>;

  constructor(key: StorageKey, storage: Store<StorageKey, unknown>) {
    super();
    this.key = key;
    this.storage = storage;
  }

  subscribe = (subscriber: Subscriber<string | null>) => {
    subscriber(this.storage.getItem(this.key));
    return super.subscribe(subscriber);
  };

  next = (value: string | null | SetFunction<string | null>): void => {
    const prevValue = this.storage.getItem(this.key);
    const newValue = isSetFunction(value) ? value(prevValue) : value;

    if (prevValue === newValue) {
      return;
    }

    if (newValue == null) {
      this.storage.removeItem(this.key);
    } else {
      this.storage.setItem(this.key, newValue);
    }

    super.next(newValue);
  };

  getValue = () => {
    return this.storage.getItem(this.key);
  };
}
