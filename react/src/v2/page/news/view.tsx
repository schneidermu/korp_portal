import { useState } from "react";

import { useParams } from "react-router-dom";

import { css } from "@styled-system/css";
import { Center, HStack, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import {
  SaxArrowLeftLinear,
  SaxArrowRightLinear,
  SaxFrame2Outline,
} from "@meysam213/iconsax-react";

import { resolveMediaPath } from "@/shared/utils";

import { useFetchNews } from "@api/news";
import { LINK } from "@app/routes";
import { formatDate, parseAPIDate } from "@util/date";
import { Breadcrumbs } from "@ui/molecules/navigation";
import { IconButton } from "@ui/atoms/buttons";
import { HomeSection } from "@view/HomeSection";
import { PagedNewsGallery } from "@view/PagedNewsGallery";
import { ProfileCard } from "@view/ProfileCard";

export default function NewsViewPage() {
  const params = useParams();
  const newsId = Number(params.newsId);
  const { data: news } = useFetchNews(Number.isNaN(newsId) ? null : newsId);

  if (Number.isNaN(newsId) || !news) return;

  return (
    <styled.article className={stack({ gap: 9 })}>
      <Stack gap={8}>
        <Breadcrumbs />
        <styled.h1 fontSize="Headline/H1">
          Новость от{" "}
          {formatDate(parseAPIDate(news.pubDate), { month: "short" })}
        </styled.h1>
      </Stack>
      <Stack gap={6}>
        <Stack gap={3}>
          <styled.h2 fontSize="Headline/H2">{news.title}</styled.h2>
          {news.author && <ProfileCard userId={news.author} />}
        </Stack>
        <Gallery images={news.images} />
      </Stack>
      <Stack mx={52} gap="1em" fontSize="Body/M" fontWeight="light">
        {news.text.split("\n").map((para) => (
          <p>{para}</p>
        ))}
      </Stack>
      <HomeSection
        heading="Последние новости"
        actionText="Показать все"
        actionLink={LINK.news.link}
      >
        <PagedNewsGallery />
      </HomeSection>
    </styled.article>
  );
}

const Gallery = ({ images }: { images: string[] }) => {
  const [ind, setInd] = useState(0);

  return (
    <Center
      aspectRatio="16 / 9"
      bg="Corporate/Accent"
      minW="0"
      h="full"
      borderRadius="35px" /*FIXME*/
      position="relative"
    >
      {images[ind] ? (
        <styled.img
          objectFit="cover"
          borderRadius="35px" /*FIXME*/
          w="full"
          h="full"
          src={resolveMediaPath(images[ind])}
        />
      ) : (
        <SaxFrame2Outline className={css({ w: 12, h: 12 })} color="white" />
      )}
      {images.length > 1 && (
        <HStack position="absolute" bottom="5%" right="5%">
          <IconButton
            onClick={() => setInd(ind - 1)}
            bg={{ base: "white", _disabled: undefined }}
            disabled={ind === 0}
            borderRadius="full"
            p={2}
          >
            <SaxArrowLeftLinear />
          </IconButton>
          <IconButton
            onClick={() => setInd(ind + 1)}
            bg={{ base: "white", _disabled: undefined }}
            borderRadius="full"
            disabled={ind >= images.length - 1}
            p={2}
          >
            <SaxArrowRightLinear />
          </IconButton>
        </HStack>
      )}
    </Center>
  );
};
