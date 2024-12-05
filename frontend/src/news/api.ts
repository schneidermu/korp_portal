import useSWRInfinite from "swr/infinite";
import { Paged } from "../common/types";
import { NEWS_PAGE_LIMIT } from "../const";
import { Post } from "./types";
import { useTokenFetcher } from "../auth/slice";

interface PostData {
  id: number;
  title: string;
  text: string;
  attachments: {
    image: string; // URI
  }[];
  video: string | null; // URI
  organization: number[];
  pub_date: string; // date
}

const toPost = (data: PostData): Post => ({
  id: data.id,
  title: data.title,
  text: data.text,
  images: data.attachments.map((a) => a.image),
  video: data.video,
  organizations: data.organization,
  publishedAt: new Date(data.pub_date),
});

export const useNews = () => {
  const fetcher = useTokenFetcher();

  const limit = NEWS_PAGE_LIMIT;

  const getKey = (index: number, prevPage: Paged<PostData>) => {
    if (index === 0) return `/news/?limit=${limit}`;
    if (prevPage && prevPage.next === null) return null;
    const offset = limit * index;
    return `/news/?limit=${limit}&offset=${offset}`;
  };

  const {
    data: pages,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
  } = useSWRInfinite<Paged<PostData>>(getKey, (key: string) =>
    fetcher(key).then((res) => res.json()),
  );

  const allAreLoaded = pages && pages[pages.length - 1]?.next === null;

  return {
    posts: pages?.flatMap((page) => page.results.map(toPost)),
    error,
    isLoading,
    isValidating,
    allAreLoaded,
    size,
    setSize,
  };
};
