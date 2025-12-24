import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { Box, Grid, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { useFetchNewsPage } from "@api/news";
import { GROUP } from "@app/const";
import { LINK } from "@app/routes";
import { Breadcrumbs } from "@ui/molecules/navigation";
import { Button } from "@ui/atoms/buttons";
import { HomeSection } from "@view/HomeSection";
import { NewsCard } from "@view/NewsCard";
import { PagedNewsGallery } from "@view/PagedNewsGallery";
import { Pagination } from "@ui/molecules/navigation";
import { ShowProtected } from "@view/ShowProtected";

export default function NewsPage() {
  return (
    <Stack gap={8}>
      <Header />
      <LatestNews />
      <Feed />
    </Stack>
  );
}

const Header = () => {
  const navigate = useNavigate();

  return (
    <Grid
      columnGap={8}
      rowGap={2}
      gridTemplateColumns="1fr auto"
      alignItems="center"
    >
      <Breadcrumbs />
      <Box gridRow="span 2">
        <ShowProtected groups={[GROUP.news.create]}>
          <Button size="L" onClick={() => navigate(LINK.newsCreate.link)}>
            Создать новость
          </Button>
        </ShowProtected>
      </Box>
      <styled.h1 fontSize="Headline/H1">Наша жизнь</styled.h1>
    </Grid>
  );
};

const LatestNews = () => {
  const { data } = useFetchNewsPage({ size: 3 });

  if (!data) return;
  const { news } = data;

  return (
    <styled.article className={stack({ gap: 6 })}>
      <styled.h1 fontSize="Headline/H2">Последние новости</styled.h1>
      <Grid gridTemplate="1fr 1fr / 7fr 9fr" gap={8}>
        <NewsCard news={news[0]} gridRow="span 2" />
        <NewsCard news={news[1]} horizontal />
        <NewsCard news={news[2]} horizontal />
      </Grid>
    </styled.article>
  );
};

const Feed = () => {
  const size = 12;
  const [page, setPage] = useState(0);
  const { data } = useFetchNewsPage({ size, page });

  if (!data) return;
  const { news, pageCount } = data;

  return (
    <styled.article className={stack({ gap: 8 })}>
      <Stack gap={6}>
        <styled.h1 fontSize="Headline/H2">Все новости</styled.h1>
        <Grid
          gridTemplateColumns="repeat(auto-fit, minmax(20rem, 1fr))"
          gap={8}
        >
          {news.map((n) => (
            <NewsCard news={n} />
          ))}
        </Grid>
      </Stack>
      <Pagination {...{ page, pageCount, setPage }} />
      <HomeSection
        heading="Последние новости"
        actionText="Показать все"
        actionLink={LINK.news.link}
      >
        <PagedNewsGallery />
      </HomeSection>
    </styled.article>
  );
};
