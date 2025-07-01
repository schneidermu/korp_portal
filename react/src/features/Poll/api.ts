import useSWR, { mutate } from "swr";

import { tokenFetch, useTokenFetcher } from "@/features/auth/hooks.ts";
import { APIError } from "@/shared/utils/error.ts";

import { Poll, PollStats, PollStatsRaw, toPoll, toPollStats } from "./types.ts";

export const useFetchPoll = (id: number | null) => {
  const fetcher = useTokenFetcher();

  return useSWR<Poll>(id === null ? null : `/polls/${id}/`, (path: string) =>
    fetcher(path)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError(`fetching poll ${id}`, res);
        }
        return res.json();
      })
      .then(toPoll),
  );
};

export const removePoll = async (token: string, id: number) => {
  const res = await tokenFetch(token, `/polls/${id}/`, { method: "DELETE" });
  if (res.status !== 204) {
    throw new APIError(`removing poll ${id}`, res);
  }
  mutate(
    `/polls/`,
    (polls?: Poll[]) => polls?.filter((poll) => poll.id !== id),
    { revalidate: false },
  );
  return res;
};

export const useFetchStats = (id: number) => {
  const tokenFetch = useTokenFetcher();

  return useSWR<PollStats>(`/polls/${id}/statistics/`, (path: string) =>
    tokenFetch(path)
      .then((res) => res.json())
      .then((raw: PollStatsRaw) => toPollStats(raw)),
  );
};

export const useFetchGroups = () => {
  const tokenFetch = useTokenFetcher();

  return useSWR<{ [key: number]: { name: string; desc: string } }>(
    `/poll_groups/`,
    (path: string) =>
      tokenFetch(path)
        .then((res) => res.json())
        .then((raw: { id: number; name: string; description: string }[]) =>
          Object.fromEntries(
            raw.map((g) => [
              g.id,
              {
                name: g.name,
                desc: g.description,
              },
            ]),
          ),
        ),
  );
};
