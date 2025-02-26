import { useMemo, useState } from "react";

import { produce } from "immer";
import useSWRInfinite from "swr/infinite";

import { BIRTHDAY_NEWS_EXPIRY, FEED_PAGE_LIMIT, MS_PER_DAY } from "@/app/const";

import { useAuth, useTokenFetcher } from "@/auth/slice";
import { Paged } from "@/common/types";
import { Birthday, News, Poll, Post } from "./types";
import { useFetchUsers } from "@/user/api";
import { User } from "@/user/types";

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
  choices: {
    id: number;
    choice_text: string;
    who_voted: string[];
    voted: number;
  }[];
  is_anonymous: boolean;
  is_multiple_choice: boolean;
  pub_date: string;
  voted_count: number;
  organization: number[];
}

const toPoll = (data: PollData, userId: string): Poll => {
  const myChoices = new Set(
    data.choices
      .filter(({ who_voted }) => who_voted.includes(userId))
      .map(({ id }) => id),
  );

  const choices = new Map(
    data.choices.map(({ id, choice_text, who_voted, voted }) => {
      const voters = new Set(who_voted);
      voters.delete(userId);

      return [
        id,
        {
          id,
          text: choice_text,
          voters,
          votes: voted,
        },
      ];
    }),
  );

  return {
    kind: "polls",
    id: data.id,
    question: data.question_text,
    choices,
    myChoices,
    voted: myChoices.size > 0,
    votes: data.voted_count,
    isAnonymous: data.is_anonymous,
    isMultipleChoice: data.is_multiple_choice,
    publishedAt: new Date(data.pub_date),
    orgs: new Set(data.organization),
  };
};

const usePosts = <P extends Post, Data>(
  kind: P["kind"],
  toPost: (data: Data, userId: string) => P,
  limit: number,
  orgId: number | null,
) => {
  const fetcher = useTokenFetcher();
  const { userId } = useAuth();

  const getKey = (index: number, prevPage: Paged<Data>) => {
    let key = `/${kind}/?limit=${limit}`;
    if (orgId !== null) {
      key += `&organization__id=${orgId}`;
    }
    if (index === 0) return key;
    if (prevPage && prevPage.next === null) return null;
    const offset = limit * index;
    return `${key}&offset=${offset}`;
  };

  const {
    data: pages,
    mutate,
    ...rest
  } = useSWRInfinite<Paged<P>>(
    getKey,
    (key: string) =>
      fetcher(key)
        .then((res) => res.json())
        .then((page: Paged<Data>) => ({
          ...page,
          results: page.results.map((post) => toPost(post, userId)),
        })),
    { revalidateFirstPage: false },
  );

  const pagesSetPoll = (poll: Poll): typeof pages => {
    if (!pages) {
      return;
    }

    return pages.map((page) => {
      const i = page.results.findIndex(
        (p) => p.kind === "polls" && p.id === poll.id,
      );
      const results =
        i < 0
          ? page.results
          : [
              ...page.results.slice(0, i),
              poll as P,
              ...page.results.slice(i + 1),
            ];
      return {
        ...page,
        results,
      };
    });
  };

  const setPoll = (poll: Poll) => {
    mutate(pagesSetPoll(poll), { revalidate: false });
  };

  const vote = (poll: Poll) => {
    if (!pages) {
      return;
    }

    poll = produce(poll, (poll) => {
      poll.votes += 1;
      poll.voted = true;
      for (const id of poll.myChoices) {
        const choice = poll.choices.get(id);
        if (choice) {
          choice.votes += 1;
        }
      }
    });

    const newPages = pagesSetPoll(poll);

    mutate(
      async () => {
        await fetcher("/polls/vote/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            poll_id: poll.id,
            choice_ids: [...poll.myChoices],
          }),
        });
        // Ignore the error, as we'll revalidate anyway.
        return newPages;
      },
      {
        revalidate: true,
        optimisticData: newPages,
      },
    );
  };

  const allAreLoaded = pages ? pages[pages.length - 1]?.next === null : false;

  return {
    data: pages?.flatMap((page) => page.results),
    allAreLoaded,
    vote,
    setPoll,
    ...rest,
  };
};

const useBirthdays = (orgId: number | null): Birthday[] => {
  const { data: users } = useFetchUsers(orgId);

  if (!users) return [];

  const birthdays = new Map<string, User[]>();

  for (const user of users.values()) {
    if (user.dateOfBirth === null) {
      continue;
    }

    const now = new Date();

    const birthday = new Date(user.dateOfBirth);
    let prevBirthday = new Date(
      now.getFullYear(),
      birthday.getMonth(),
      birthday.getDate(),
    );
    if (now.getTime() - prevBirthday.getTime() < 0) {
      prevBirthday = new Date(
        now.getFullYear() - 1,
        birthday.getMonth(),
        birthday.getDate(),
      );
    }

    const daysPassed = (now.getTime() - prevBirthday.getTime()) / MS_PER_DAY;

    if (daysPassed >= BIRTHDAY_NEWS_EXPIRY + 1) {
      continue;
    }

    const date =
      prevBirthday.getFullYear().toString() + user.dateOfBirth.slice(4);

    const users = birthdays.get(date) ?? [];
    birthdays.set(date, users);
    users.push(user);
  }

  const dates = [...birthdays.keys()];
  dates.sort();

  const posts: Birthday[] = [];
  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    posts.push({
      kind: "birthday",
      id: date,
      publishedAt: new Date(date),
      users: birthdays.get(date) ?? [],
    });
  }

  return posts;
};

const useNews = (limit: number, orgId: number | null) =>
  usePosts("news", toNews, limit, orgId);
const usePolls = (limit: number, orgId: number | null) =>
  usePosts("polls", toPoll, limit, orgId);

type Count = { [key in Post["kind"]]: number };

export const useFeed = (orgId: number | null) => {
  const [size, setSize] = useState(1);

  const news = useNews(FEED_PAGE_LIMIT, orgId);
  const polls = usePolls(FEED_PAGE_LIMIT, orgId);
  const birthdays = useBirthdays(orgId);

  const posts = useMemo(() => {
    const posts: Post[] = [
      ...birthdays,
      ...(news.data ?? []),
      ...(polls.data ?? []),
    ];
    // Reverse chronological order.
    posts.sort((p1, p2) => p2.publishedAt.getTime() - p1.publishedAt.getTime());
    return posts;
  }, [birthdays, news, polls]);

  const loadMore = useMemo(
    () => () => {
      if (news.isValidating || polls.isValidating) {
        return false;
      }

      const extraCounts: Count = { news: 0, polls: 0, birthday: 0 };
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
    vote: polls.vote,
    setPoll: polls.setPoll,
    loadMore,
  };
};
