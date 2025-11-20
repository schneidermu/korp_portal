import useSWR from "swr";

import * as R from "radashi";

import { useTokenFetcher } from "@/features/auth/hooks";

import { APIError } from "@api/common/errors";
import { Paged } from "@api/common/types";

import { News, NewsRaw, toNews } from "./types";

export const useFetchNews = (id: number | null) => {
  const fetcher = useTokenFetcher();

  const key = `/news/${id}/?v=2`;

  return useSWR<News>(key, (path: string) =>
    fetcher(path)
      .then((res) => {
        if (res.status !== 200) {
          return new APIError("fetching news", res);
        }
        return res.json();
      })
      .then(toNews),
  );
};

export const useFetchNewsPage = ({
  size,
  page = 0,
}: {
  size: number;
  page?: number;
}) => {
  const fetcher = useTokenFetcher();

  const key =
    "/news/?" +
    R.sift(["v=2", `limit=${size}`, `offset=${page * size}`]).join("&");

  return useSWR<{ news: News[]; pageCount: number }>(key, (path: string) =>
    fetcher(path)
      .then((res) => {
        if (res.status !== 200) {
          return new APIError("fetching news page", res);
        }
        return res.json();
      })
      .then((page: Paged<NewsRaw>) => ({
        news: page.results.map(toNews),
        pageCount: Math.ceil(page.count / size),
      })),
  );
};
