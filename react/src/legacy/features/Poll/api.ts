import useSWR, { mutate } from "swr";

import { tokenFetch, useTokenFetcher } from "@api/auth";
import { APIError } from "@api/common/errors";

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

export const useFetchPolls = ({
  kind = "plain",
  status,
  orgId,
  limit,
}: {
  kind?: Poll["kind"];
  status?: Poll["status"];
  orgId?: number;
  limit?: number;
} = {}) => {
  const fetcher = useTokenFetcher();

  let key = `/polls/?kind=${kind}`;
  if (status !== undefined) {
    key += `&status=${status}`;
  }
  if (orgId !== undefined) {
    key += `&organization__id=${orgId}`;
  }
  if (limit !== undefined) {
    key += `&limit=${limit}`;
  }

  return useSWR<Poll[]>(key, (key: string) =>
    fetcher(key)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError("fetching polls", res);
        }
        return res.json();
      })
      .then((raw) => raw.map(toPoll)),
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
