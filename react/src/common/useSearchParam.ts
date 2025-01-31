import { useCallback } from "react";

import { useSearchParams } from "react-router-dom";

export function useSearchParam(
  name: string,
): [string | null, (param: string | null) => void];

export function useSearchParam<T>(
  name: string,
  convert: (param: string) => T | null,
): [T | null, (param: string | null) => void];

export function useSearchParam<T>(
  name: string,
  convert?: (param: string) => T | null,
) {
  const [params, setParams] = useSearchParams();

  const setParam = useCallback(
    (value: string | null) =>
      setParams((prev) => {
        const params = new URLSearchParams(prev);
        if (value === null) {
          params.delete(name);
        } else {
          params.set(name, value);
        }
        return params;
      }),
    [name, setParams],
  );

  const p = params.get(name);

  if (!convert) {
    return [p, setParam];
  }

  const param = p === null ? null : convert(p);

  return [param, setParam] as const;
}

const castNaNToNull = (num: number): number | null =>
  Number.isNaN(num) ? null : num;

export const useIntSearchParam = (name: string) =>
  useSearchParam(name, (param) => castNaNToNull(parseInt(param)));

export const useQuerySearchParam = (name: string, sep = "+") => {
  const [param, setParam] = useSearchParam(name);

  const query = param?.split(sep) || [];

  const setQuery = useCallback(
    (query: string[]) => setParam(query.join(sep) || null),
    [sep, setParam],
  );

  return [query, setQuery] as const;
};
