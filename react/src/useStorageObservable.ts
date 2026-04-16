import type { StorageObservable } from "@efficimo/storage";
import { useEffect, useState } from "react";

/**
 * Subscribes to a StorageObservable and returns a [value, setter] tuple,
 * re-rendering the component whenever the storage value changes.
 */
export function useStorageObservable<K extends string>(
  obs: StorageObservable<K>,
): [string | null, (value: string | null) => void] {
  const [value, setValue] = useState<string | null>(() => obs.getValue());

  useEffect(() => {
    const subscription = obs.subscribe((v) => setValue(v));
    return () => subscription.unsubscribe();
  }, [obs]);

  return [value, (v) => obs.next(v)];
}
