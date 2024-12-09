import useSWRInfinite from "swr/infinite";
import { Paged } from "../common/types";
import { FEED_PAGE_LIMIT } from "../const";
import { Post, News, Poll } from "./types";
import { useTokenFetcher } from "../auth/slice";
import { useMemo, useState } from "react";

interface NewsData {
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

const toNews = (data: NewsData): News => ({
  kind: "news",
  id: data.id,
  title: data.title,
  text: data.text,
  images: data.attachments.map((a) => a.image),
  video: data.video,
  organizations: data.organization,
  publishedAt: new Date(data.pub_date),
});

interface PollData {
  id: number;
  question_text: string;
  choices: { id: number; choice_text: string; who_voted: string[] }[];
  is_anonymous: boolean;
  is_multiple_choice: boolean;
  pub_date: string;
}

const toPoll = (data: PollData): Poll => ({
  kind: "polls",
  title: "Опрос",
  id: data.id,
  question: data.question_text,
  choices: data.choices.map(({ id, choice_text, who_voted }) => ({
    id,
    text: choice_text,
    voters: who_voted,
  })),
  isAnonymous: data.is_anonymous,
  isMultipleChoice: data.is_multiple_choice,
  publishedAt: new Date(data.pub_date),
});

const usePosts = <P extends Post, Data>(
  kind: P["kind"],
  toPost: (data: Data) => P,
  limit: number,
) => {
  const fetcher = useTokenFetcher();

  const getKey = (index: number, prevPage: Paged<Data>) => {
    if (index === 0) return `/${kind}/?limit=${limit}`;
    if (prevPage && prevPage.next === null) return null;
    const offset = limit * index;
    return `/${kind}/?limit=${limit}&offset=${offset}`;
  };

  const { data: pages, ...rest } = useSWRInfinite<Paged<Data>>(
    getKey,
    (key: string) => fetcher(key).then((res) => res.json()),
  );

  const allAreLoaded = pages ? pages[pages.length - 1]?.next === null : false;

  return {
    data: pages?.flatMap((page) => page.results.map(toPost)),
    allAreLoaded,
    ...rest,
  };
};

const useNews = (limit: number) => usePosts("news", toNews, limit);
const usePolls = (limit: number) => usePosts("polls", toPoll, limit);

type Count = { [key in Post["kind"]]: number };

export const useFeed = () => {
  const [size, setSize] = useState(1);

  const news = useNews(FEED_PAGE_LIMIT);
  const polls = usePolls(FEED_PAGE_LIMIT);

  const posts = useMemo(() => {
    const posts: Post[] = [...(news.data ?? []), ...(polls.data ?? [])];
    // Reverse chronological order.
    posts.sort((p1, p2) => p2.publishedAt.getTime() - p1.publishedAt.getTime());
    return posts;
  }, [news, polls]);

  const loadMore = useMemo(
    () => () => {
      if (news.isValidating || polls.isValidating) {
        return false;
      }

      const extraCounts: Count = { news: 0, polls: 0 };
      for (const post of posts.slice(size * FEED_PAGE_LIMIT)) {
        extraCounts[post.kind] += 1;
      }

      if (!news.allAreLoaded && extraCounts.news < FEED_PAGE_LIMIT) {
        news.setSize((s) => s + 1);
      }
      if (!polls.allAreLoaded && extraCounts.polls < FEED_PAGE_LIMIT) {
        polls.setSize((s) => s + 1);
      }

      setSize((s) => s + 1);
      return true;
    },
    [size, polls, news, posts],
  );

  return {
    data: posts.slice(0, size * FEED_PAGE_LIMIT),
    isLoading: news.isLoading || polls.isLoading,
    isValidating: news.isValidating || polls.isValidating,
    error: news.error || polls.error,
    allAreLoaded: news.allAreLoaded && polls.allAreLoaded,
    loadMore,
  };
};

export const useSendVote = () => {
  const fetch = useTokenFetcher();
  return (kind: "for" | "against", pollId: number, choiceId: number) =>
    fetch("/polls/vote/", {
      method: kind === "for" ? "POST" : "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ poll_id: pollId, choice_id: choiceId }),
    });
};
