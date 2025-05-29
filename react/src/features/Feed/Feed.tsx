import { useState } from "react";

import {
  Button,
  Flex,
  Heading,
  HStack,
  Separator,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";

import { useAuth } from "@/features/auth/slice";
import { useFeed } from "@/features/feed/services";
import * as types from "@/features/feed/types";
import { useReachBottom } from "@/shared/hooks/useReachBottom";
import { formatDateFuller } from "@/shared/utils";

import { Page } from "@/features/App/comps/Page";

import { SearchBar } from "@/shared/comps/SearchBar";

import { ImgGrid } from "./comps/ImgGrid";

export const News = ({ news }: { news: types.News }) => {
  return (
    <Stack as="article" gap="8">
      <Stack gap="2">
        <Heading as="h2" color="blue.4" fontSize="2xl" fontWeight="bold">
          {news.title}
        </Heading>
        <Separator borderWidth={1} borderColor="gray.4" />
        <Text fontSize="sm" color="gray.4">
          {formatDateFuller(news.publishedAt)}
        </Text>

        <ImgGrid imgs={news.images} />
      </Stack>

      <Stack fontSize="2xl" px="2" gap="5">
        {news.text.split("\n").map((para, i) => (
          <Text key={i}>{para}</Text>
        ))}
      </Stack>
    </Stack>
  );
};

export const FeedPage = () => {
  const { orgId } = useAuth();
  const [showNews, setShowNews] = useState(true);
  const [showPolls, setShowPolls] = useState(true);
  const [query, setQuery] = useState("");

  const {
    data: posts,
    loadMore,
    allAreLoaded,
  } = useFeed({ orgId, showPolls, showNews, query });
  useReachBottom(loadMore);

  if (!posts) return;

  return (
    <Page>
      <Flex fontSize="2xl" color="blue.2" mb="4" justify="space-between">
        <HStack>
          <Button
            fontSize="2xl"
            color="blue.2"
            bg="transparent"
            px="0"
            onClick={() => setShowNews(!showNews)}
            textDecoration={showNews ? "underline" : undefined}
          >
            Новости
          </Button>
          &ndash;
          <Button
            fontSize="2xl"
            color="blue.2"
            bg="transparent"
            px="0"
            onClick={() => setShowPolls(!showPolls)}
            textDecoration={showPolls ? "underline" : undefined}
          >
            Опросы
          </Button>
        </HStack>

        <SearchBar width="30%" debounceDelay={300} onDebounce={setQuery} />
      </Flex>

      <Stack gap="20">
        {posts.map(
          (post) => post.kind === "news" && <News key={post.id} news={post} />,
        )}
      </Stack>
      <Show when={allAreLoaded && posts.length > 0}>
        <Separator my="4" borderWidth={1} borderColor="gray.4" />
        <Text fontSize="lg" textAlign="center">
          Вы прочитали все записи
        </Text>
      </Show>
      <Show when={posts.length === 0}>
        <Text fontSize="lg" textAlign="center">
          Ничего не найдено!
        </Text>
      </Show>
    </Page>
  );
};
