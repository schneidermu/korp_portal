import { Grid, styled } from "@styled-system/jsx";

import { useFetchSegments } from "@api/segment";

import { stack } from "@styled-system/patterns";
import { Button } from "@ui/atoms/buttons";
import { SegmentView } from "@view/SegmentView";
import { Link } from "react-router-dom";

export const Segments = () => {
  const { data: segments } = useFetchSegments();

  const favSegments = segments?.filter((s) => s.isFavorite);

  if (favSegments && favSegments.length === 0) {
    return (
      <styled.article
        className={stack({ gap: 4, align: "center" })}
        p={6}
        borderWidth="1px"
        borderRadius="24px"
        borderColor="Grayscale/SpacerLight"
        shadow="S"
      >
        <styled.h1 fontWeight="semibold">Добавьте сегменты</styled.h1>
        <styled.p fontSize="Body/XS">
          Добавьте в избранное, чтобы быстро находить нужные сегменты!
        </styled.p>
        <Link to="/segments">
          <Button>Добавить сегменты</Button>
        </Link>
      </styled.article>
    );
  }

  return (
    <Grid gridTemplateColumns="repeat(auto-fit, minmax(24rem, 1fr))">
      {favSegments?.map((s) => (
        <SegmentView key={s.id} segment={s} />
      ))}
    </Grid>
  );
};
