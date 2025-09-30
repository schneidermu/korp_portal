import { useState } from "react";

import { Link } from "react-router-dom";

import { css } from "@styled-system/css";
import {
  BoxProps,
  Flex,
  Grid,
  GridProps,
  HStack,
  Stack,
  styled,
} from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { useFetchNews } from "@api/news";
import { useFetchPolls } from "@api/poll";

import { Button, IconButton } from "@view/Button";

import { NewsCard } from "./view/NewsCard";
import { PollCard } from "./view/PollCard";

import {
  SaxArrowLeftOutline,
  SaxArrowRight1Outline,
} from "@meysam213/iconsax-react";
import { Segments } from "./view/Segments";

const Section = ({
  heading,
  actionText,
  actionLink,
  children,
  ...rest
}: {
  heading: string;
  actionText: string;
  actionLink: string;
} & BoxProps) => {
  return (
    <styled.section className={stack({ gap: 6 })} {...rest}>
      <HStack justify="space-between">
        <styled.h1 fontSize="Headline/H2">{heading}</styled.h1>
        <Link to={actionLink}>
          <Button variant="text" size="L">
            {actionText}
          </Button>
        </Link>
      </HStack>
      {children}
    </styled.section>
  );
};

const Cards = ({ children, ...rest }: GridProps) => {
  return (
    <Grid gridTemplateColumns="1fr 1fr 1fr 1fr" gap={8} {...rest}>
      {children}
    </Grid>
  );
};

const mergePages = <T,>(page1: T[], page2: T[], cur: number): T[] => [
  ...page1.slice(cur),
  ...page2.slice(0, cur),
];

const CardsControls = ({
  len1,
  len2,
  limit,
  cur,
  setCur,
}: {
  len1: number | undefined;
  len2: number | undefined;
  limit: number;
  cur: number;
  setCur: (cursor: number) => void;
}) => {
  return (
    <Flex justify="end">
      <IconButton disabled={cur === 0} onClick={() => setCur(cur - 1)}>
        <SaxArrowLeftOutline className={css({ w: 6, h: 6 })} />
      </IconButton>
      <IconButton
        disabled={
          len1 === undefined ||
          len2 === undefined ||
          (len1 < limit && len2 === 0) ||
          (len2 < limit && cur % limit === limit - 1)
        }
        onClick={() => setCur(cur + 1)}
      >
        <SaxArrowRight1Outline className={css({ w: 6, h: 6 })} />
      </IconButton>
    </Flex>
  );
};

const NewsCards = () => {
  const [cur, setCur] = useState(0);

  const limit = 4;
  const offset = Math.floor(cur / limit) * limit;

  const { data: news1 } = useFetchNews({ limit, offset });
  const { data: news2 } = useFetchNews({ limit, offset: offset + limit });

  const news = mergePages(news1 ?? [], news2 ?? [], cur % limit);

  return (
    <Stack gap={3}>
      <CardsControls
        cur={cur}
        setCur={setCur}
        len1={news1?.length}
        len2={news2?.length}
        limit={limit}
      />
      <Cards>
        {news.map((n) => (
          <NewsCard key={n.id} news={n} />
        ))}
      </Cards>
    </Stack>
  );
};

const PollCards = () => {
  const [cur, setCur] = useState(0);

  const limit = 4;
  const offset = Math.floor(cur / limit) * limit;

  const { data: polls1 } = useFetchPolls({
    status: "published",
    limit,
    offset,
  });
  const { data: polls2 } = useFetchPolls({
    status: "published",
    limit,
    offset: offset + limit,
  });

  const polls = mergePages(polls1 ?? [], polls2 ?? [], cur % limit);

  return (
    <Stack gap={3}>
      <CardsControls
        cur={cur}
        setCur={setCur}
        len1={polls1?.length}
        len2={polls2?.length}
        limit={limit}
      />
      <Cards>
        {polls?.map((p) => (
          <PollCard key={p.id} poll={p} />
        ))}
      </Cards>
    </Stack>
  );
};

export default function HomePage() {
  return (
    <>
      <Section
        heading="Избранные сегменты"
        actionText="Показать все"
        actionLink="/segments"
      >
        <Segments />
      </Section>
      <Section
        heading="Наша жизнь"
        actionText="Показать все"
        actionLink="/feed"
      >
        <NewsCards />
      </Section>
      <Section
        heading="Опросы"
        actionText="Показать все"
        actionLink="/polls/dashboard"
      >
        <PollCards />
      </Section>
    </>
  );
}
