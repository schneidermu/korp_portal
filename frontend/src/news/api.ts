import useSWRInfinite from "swr/infinite";
import { Paged } from "../common/types";
import { Post } from "./types";
import { fetcher } from "../auth/slice";

interface PostData {
  id: number;
  title: string;
  text: string;
  attachments: {
    image: string; // URI
  }[];
  video: string | null; // URI
  organization: number[];
}

const toPost = (data: PostData): Post => ({
  id: data.id,
  title: data.title,
  text: data.text,
  images: data.attachments.map((a) => a.image),
  video: data.video,
  organizations: data.organization,
});

export const useNews = () => {
  const getKey = (index: number, prevPage: Paged<PostData>) => {
    if (index === 0) return "/news/";
    if (prevPage && prevPage.next === null) return null;
    return `/news/?page=${index + 1}`;
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
