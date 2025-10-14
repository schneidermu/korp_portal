import { Link } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, BoxProps, Center, Flex, Stack, styled } from "@styled-system/jsx";
import { flex } from "@styled-system/patterns";

import { SaxFrame2Outline } from "@meysam213/iconsax-react";

import { resolveMediaPath } from "@/shared/utils";

import { News } from "@api/news/types";
import { useFetchUser } from "@api/user";
import { fullNameShort } from "@api/user/utils";
import { LINK } from "@app/routes";
import { formatDate, parseAPIDate } from "@util/date";

const PreviewImg = ({ src }: { src: string | undefined }) => {
  return (
    <Center
      aspectRatio="16 / 9"
      bg="Corporate/Accent"
      minW="0"
      h="full"
      borderRadius="8px" /*FIXME*/
    >
      {src ? (
        <styled.img
          objectFit="cover"
          borderRadius="8px" /*FIXME*/
          w="full"
          h="full"
          src={src}
        />
      ) : (
        <SaxFrame2Outline className={css({ w: 12, h: 12 })} color="white" />
      )}
    </Center>
  );
};

export const NewsCard = ({
  news,
  horizontal = false,
  ...rest
}: { news: News; horizontal?: boolean } & BoxProps) => {
  const previewSrc = news.images[0] && resolveMediaPath(news.images[0]);

  const { data: author } = useFetchUser(news.author);

  return (
    <styled.article
      className={flex({
        gap: horizontal ? 6 : 3,
        direction: horizontal ? "row" : "column",
      })}
      minW={0}
      p={5}
      borderWidth="1px"
      borderColor="Grayscale/SpacerLight"
      transition="all 0.3s"
      shadow={{ base: "S", _hover: "L" }}
      borderRadius="12px" /*FIXME*/
      {...rest}
    >
      <Link to={`${LINK.newsView.link}/${news.id}`}>
        <PreviewImg src={previewSrc} />
      </Link>
      <Stack gap={3}>
        <Link to={`${LINK.newsView.link}/${news.id}`}>
          <styled.h1
            fontSize="Headline/H4"
            fontWeight="semibold"
            lineClamp="3"
            h="3.6em"
          >
            {news.title}
          </styled.h1>
        </Link>
        <Flex align="end" flexGrow="1">
          <Box lineClamp="4" fontSize="Body/M" fontWeight="light" h="4.8em">
            {news.text}
          </Box>
        </Flex>
        <Box>
          <Box fontSize="Body/S">{author && fullNameShort(author)}</Box>
          <Box fontSize="Body/XS" color="Grayscale/Border">
            {formatDate(parseAPIDate(news.pubDate), {
              month: "short",
              weekday: "short",
            })}
          </Box>
        </Box>
      </Stack>
    </styled.article>
  );
};
