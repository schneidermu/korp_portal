import { Temporal } from "temporal-polyfill";

import { Link } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, Center, Flex, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { resolveMediaPath } from "@/shared/utils";

import { News } from "@api/news/types";

import { SaxFrame2Outline } from "@meysam213/iconsax-react";

import { formatDate } from "@util/date";
import { useFetchUser } from "@api/user";
import { fullNameShort } from "@api/user/utils";

const PreviewImg = ({ src }: { src: string | undefined }) => {
  return (
    <Center
      aspectRatio="16 / 9"
      bg="Corporate/Accent"
      minW="0"
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

export const NewsCard = ({ news }: { news: News }) => {
  const previewSrc = news.images[0] && resolveMediaPath(news.images[0]);

  const { data: author } = useFetchUser(news.author);

  return (
    <styled.article
      className={stack({ gap: 3 })}
      minW={0}
      p={5}
      borderWidth="1px"
      borderColor="Grayscale/SpacerLight"
      transition="all 0.3s"
      shadow={{ base: "S", _hover: "L" }}
      borderRadius="12px" /*FIXME*/
    >
      <Link to={`/feed/` /*TODO*/}>
        <PreviewImg src={previewSrc} />
      </Link>
      <Link to={`/feed/`}>
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
          {formatDate(
            Temporal.PlainDateTime.from(
              news.pubDate.slice(0, -1),
            ).toPlainDate(),
          )}
        </Box>
      </Box>
    </styled.article>
  );
};
