import { useEffect, useState } from "react";

export const useDebounceState = <T>(
  initialState: T,
  delay: number,
  onDebounce: (value: T) => void,
) => {
  const [value, setValue] = useState(initialState);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onDebounce(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay, onDebounce]);

  return [value, setValue] as const;
};
