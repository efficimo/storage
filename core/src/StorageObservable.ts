import {
  isSetFunction,
  Observable,
  type ObservableValueInterface,
  type SetFunction,
  type Subscriber,
} from "@efficimo/observable";

export class StorageObservable<StorageKey extends string>
  extends Observable<string | null>
  implements ObservableValueInterface<string | null>
{
  private key: StorageKey;
  private storage: Storage;

  constructor(key: StorageKey, storage: Storage) {
    super();
    this.key = key;
    this.storage = storage;
  }

  subscribe = (subscriber: Subscriber<string | null>) => {
    subscriber(this.storage.getItem(this.key));
    return super.subscribe(subscriber);
  };

  next = async (value: string | null | SetFunction<string | null>) => {
    const prevValue = this.storage.getItem(this.key);
    const newValue = isSetFunction(value) ? await value(prevValue) : value;

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
