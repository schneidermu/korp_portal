import { BACKEND_API_PREFIX } from "@/app/const";

import { useToken } from "./slice";

export const fetcher = (path: string, init?: RequestInit) =>
  fetch(BACKEND_API_PREFIX + path, init);

export const tokenFetch = async (
  token: string,
  path: string,
  init?: RequestInit,
) =>
  fetcher(path, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: "Token " + token,
    },
  });

export const useTokenFetcher = () => {
  const token = useToken();

  return async (path: string, init?: RequestInit) =>
    tokenFetch(token, path, init);
};
