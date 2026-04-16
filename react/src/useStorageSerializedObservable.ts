import type { JsonSerializeObservableValue } from "@efficimo/observable";
import { useEffect, useState } from "react";

/**
 * Subscribes to a JsonSerializeObservableValue (from BaseStorage.getSerializedObservable)
 * and returns a typed [value, setter] tuple.
 */
export function useStorageSerializedObservable<T>(
  obs: JsonSerializeObservableValue<T>,
): [T | null, (value: T | null) => void] {
  const [value, setValue] = useState<T | null>(() => obs.getValue());

  useEffect(() => {
    const subscription = obs.subscribe((v) => setValue(v));
    return () => subscription.unsubscribe();
  }, [obs]);

  return [value, (v) => obs.next(v)];
}
