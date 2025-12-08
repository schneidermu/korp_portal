import { useState } from "react";

import { useFetchPolls } from "@api/poll";
import { PagedCardsGallery } from "@view/PagedCardsGallery";
import { PagedNewsGallery } from "@view/PagedNewsGallery";
import { HomeSection } from "@view/HomeSection";

import { PollCard } from "./view/PollCard";
import { Segments } from "./view/Segments";
import { SecretSanta } from "@ui/organisms/seasonal";

const mergePages = <T,>(page1: T[], page2: T[], cur: number): T[] => [
  ...page1.slice(cur),
  ...page2.slice(0, cur),
];

const PollCards = () => {
  const [cur, setCur] = useState(0);

  const size = 4;
  const page = Math.floor(cur / size);

  const { data: data1 } = useFetchPolls({
    status: "published",
    size,
    page,
  });
  const { data: data2 } = useFetchPolls({
    status: "published",
    size,
    page: page + 1,
  });

  const polls = mergePages(data1?.polls ?? [], data2?.polls ?? [], cur % size);

  return (
    <PagedCardsGallery
      len1={data1?.polls?.length}
      len2={data2?.polls?.length}
      {...{ cur, setCur, size }}
    >
      {polls?.map((p) => (
        <PollCard key={p.id} poll={p} />
      ))}
    </PagedCardsGallery>
  );
};

export default function HomePage() {
  return (
    <>
      <HomeSection
        heading="Избранные сегменты"
        actionText="Показать все"
        actionLink="/segments"
      >
        <Segments />
      </HomeSection>
      <SecretSanta />
      <HomeSection
        heading="Наша жизнь"
        actionText="Показать все"
        actionLink="/feed"
      >
        <PagedNewsGallery />
      </HomeSection>
      <HomeSection
        heading="Опросы"
        actionText="Показать все"
        actionLink="/polls/dashboard"
      >
        <PollCards />
      </HomeSection>
    </>
  );
}
