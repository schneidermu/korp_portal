import useSWR from "swr";

import * as R from "radashi";

import { useTokenFetcher } from "@/features/auth/hooks";
import { Poll, PollRaw, toPoll } from "@/features/Poll/types";

import { APIError } from "@api/common/errors";
import { Paged } from "@api/common/types";

export const useFetchPolls = ({
  kind = "plain",
  status,
  orgId,
  limit,
  offset = 0,
}: {
  kind?: Poll["kind"];
  status?: Poll["status"];
  orgId?: number;
  limit?: number;
  offset?: number;
} = {}) => {
  const fetcher = useTokenFetcher();

  const key =
    "/polls?" +
    R.sift([
      "v=2",
      `kind=${kind}`,
      status && `status=${status}`,
      orgId && `&organization__id=${orgId}`,
      limit && `&limit=${limit}`,
      `&offset=${offset}`,
    ]).join("&");

  return useSWR<Poll[]>(key, (path: string) =>
    fetcher(path)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError("fetching polls", res);
        }
        return res.json();
      })
      .then((page: Paged<PollRaw>) => page.results.map(toPoll)),
  );
};
