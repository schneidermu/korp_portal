import { useState, useMemo } from "react";
import { useFetchNewsPage } from "../api/news";
import { NewsCard } from "./NewsCard";
import { PagedCardsGallery } from "./PagedCardsGallery";

export const PagedNewsGallery = () => {
  const [cur, setCur] = useState(0);

  const size = 4;
  const page = Math.floor(cur / size);

  const { data: data1 } = useFetchNewsPage({ size, page });
  const { data: data2 } = useFetchNewsPage({ size, page: page + 1 });

  const news1 = useMemo(() => data1?.news ?? [], [data1?.news]);
  const news2 = useMemo(() => data2?.news ?? [], [data2?.news]);

  const news = [...news1.slice(cur % size), ...news2.slice(0, cur % size)];

  return (
    <PagedCardsGallery
      len1={news1?.length}
      len2={news2?.length}
      {...{ cur, setCur, size }}
    >
      {news.map((n) => (
        <NewsCard key={n.id} news={n} />
      ))}
    </PagedCardsGallery>
  );
};
