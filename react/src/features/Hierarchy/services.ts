import { useTokenFetcher } from "@/features/auth/hooks.ts";
import useSWR from "swr";

export const useFetchHierarchy = (orgId: number) => {
  const tokenFetch = useTokenFetcher();

  return useSWR(`/hierarchy/${orgId}/`, (path: string) =>
    tokenFetch(path)
      .then((res) => res.json())
      .then(console.log),
  );
};
