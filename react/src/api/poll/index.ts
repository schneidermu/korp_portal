import useSWR from "swr";

import * as R from "radashi";

import { useTokenFetcher } from "@api/auth";
import { Poll, PollRaw, toPoll } from "@legacy/features/Poll/types";

import { APIError } from "@api/common/errors";
import { Paged } from "@api/common/types";

export const useFetchPolls = ({
  kind = "plain",
  status,
  orgId,
  size,
  page = 0,
}: {
  kind?: Poll["kind"];
  status?: Poll["status"];
  orgId?: number;
  size: number;
  page?: number;
}) => {
  const fetcher = useTokenFetcher();

  const key =
    "/polls?" +
    R.sift([
      "v=2",
      `kind=${kind}`,
      status && `status=${status}`,
      orgId && `&organization__id=${orgId}`,
      `&limit=${size}`,
      `&offset=${page * size}`,
    ]).join("&");

  return useSWR<{ polls: Poll[]; pageCount: number }>(key, (path: string) =>
    fetcher(path)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError("fetching polls", res);
        }
        return res.json();
      })
      .then((page: Paged<PollRaw>) => ({
        polls: page.results.map(toPoll),
        pageCount: Math.ceil(page.count / size),
      })),
  );
};
