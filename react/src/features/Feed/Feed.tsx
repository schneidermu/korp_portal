import { useState } from "react";

import {
  Flex,
  Heading,
  HStack,
  Separator,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";

import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/slice";
import { useFeed } from "@/features/feed/services";
import * as types from "@/features/feed/types";
import { useReachBottom } from "@/shared/hooks/useReachBottom";
import { formatDateFuller } from "@/shared/utils";

import { Page } from "@/features/App/comps/Page";

import { SearchBar } from "@/shared/comps/SearchBar";
import { Button } from "@/shared/comps/Button";

import { ImgGrid } from "./comps/ImgGrid";
import { PageHeading } from "@/features/App/comps/PageHeading.tsx";

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

export default function FeedPage() {
  const { groups, orgId } = useAuth();
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
      <PageHeading title="Наша жизнь">
        <SearchBar width="40%" debounceDelay={300} onDebounce={setQuery} />
      </PageHeading>

      <Flex justify="space-between" mb={8}>
        <HStack>
          <Button
            variant="ghost"
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
            variant="ghost"
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
        <Show when={groups.includes("post-news")}>
          <Link to="/post-news">
            <Button variant="solid">Опубликовать новость</Button>
          </Link>
        </Show>
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
}
