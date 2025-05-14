import { useEffect, useState } from "react";

import {
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Image,
  Separator,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

import { useAuth } from "@/features/auth/slice.ts";
import { useFeed } from "@/features/feed/services";
import * as types from "@/features/feed/types";
import { useReachBottom } from "@/shared/hooks/useReachBottom";
import { formatDateFuller, resolveMediaPath } from "@/shared/utils";

import { NewPage } from "@/features/App/comps/NewPage";

import { SearchBar } from "@/shared/comps/SearchBarNew";
import { Overlay } from "./parts/Overlay";
import { SlideButtonLeft, SlideButtonRight } from "./parts/SlideButtons";

const OverlayImg = ({
  imgs,
  index,
  onClose,
}: {
  imgs: string[];
  index: number | null;
  onClose: () => void;
}) => {
  const [j, setJ] = useState<number | null>(index);

  useEffect(() => setJ(index), [index]);

  useEffect(() => {
    if (j === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const { key } = event;
      if (key === "ArrowLeft" && j > 0) {
        setJ(j - 1);
      }
      if (key === "ArrowRight" && j + 1 < imgs.length) {
        setJ(j + 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [j, imgs.length]);

  return (
    <Overlay position="relative" present={j !== null} onClose={onClose}>
      {j !== null && (
        <>
          <IconButton
            position="absolute"
            p="2"
            w="10"
            h="10"
            bottom="100%"
            left="100%"
            onClick={onClose}
            _hover={{ color: "blue.2" }}
          >
            <LuX style={{ width: "100%", height: "100%" }} />
          </IconButton>
          <SlideButtonLeft disabled={j <= 0} onClick={() => setJ(j - 1)} />
          <SlideButtonRight
            disabled={j + 1 >= imgs.length}
            onClick={() => setJ(j + 1)}
          />
          <Image
            role="button"
            w="74rem"
            h="42rem"
            userSelect="none"
            cursor="default"
            src={resolveMediaPath(imgs[j])}
            onClick={onClose}
          />
        </>
      )}
    </Overlay>
  );
};

const ImgGrid = ({ imgs }: { imgs: string[] }) => {
  const [windowInd, setWindowIndex] = useState(0);
  const [overlayImg, setOverlayImg] = useState<number | null>(null);

  const windowSize = 4;
  const step = 2;

  return (
    <Grid
      gridAutoFlow="column"
      templateColumns="1fr 1fr"
      templateRows="24rem 24rem"
      gapX="6"
      gapY="5"
      position="relative"
    >
      <SlideButtonLeft
        disabled={windowInd <= 0}
        onClick={() => setWindowIndex(windowInd - step)}
      />
      <SlideButtonRight
        disabled={windowInd + windowSize >= imgs.length}
        onClick={() => setWindowIndex(windowInd + step)}
      />
      {imgs.slice(windowInd, windowInd + windowSize).map((src, i) => (
        <Image
          key={src}
          role="button"
          w="full"
          h="full"
          userSelect="none"
          src={resolveMediaPath(src)}
          onClick={() => setOverlayImg(i)}
        />
      ))}

      <OverlayImg
        imgs={imgs}
        index={overlayImg}
        onClose={() => setOverlayImg(null)}
      />
    </Grid>
  );
};

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

export const NewFeedPage = () => {
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
    <NewPage>
      <Flex fontSize="2xl" color="blue.2" mb="4" justify="space-between">
        <HStack>
          <Button
            onClick={() => setShowNews(!showNews)}
            textDecoration={showNews ? "underline" : undefined}
          >
            Новости
          </Button>
          &ndash;
          <Button
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
    </NewPage>
  );
};
