import useSWR from "swr";

import * as R from "radashi";

import { useTokenFetcher } from "@/features/auth/hooks";

import { APIError } from "@api/common/errors";
import { Paged } from "@api/common/types";

import { News, NewsRaw, toNews } from "./types";

export const useFetchNews = ({
  orgId,
  limit,
  offset = 0,
}: {
  orgId?: number;
  limit: number;
  offset?: number;
}) => {
  const fetcher = useTokenFetcher();

  const key =
    "/news/?" +
    R.sift([
      "v=2",
      `limit=${limit}`,
      `offset=${offset}`,
      orgId && `organization__id=${orgId}`,
    ]).join("&");

  return useSWR<News[]>(key, (path: string) =>
    fetcher(path)
      .then((res) => {
        if (res.status !== 200) {
          return new APIError("fetching news", res);
        }
        return res.json();
      })
      .then((page: Paged<NewsRaw>) => page.results.map(toNews)),
  );
};
