import { Grid } from "@styled-system/jsx";

import { useFetchSegments } from "@api/segment";

import { SegmentView } from "@view/SegmentView";

export const Segments = () => {
  const { data: segments } = useFetchSegments();

  return (
    <Grid gridTemplateColumns="repeat(auto-fit, minmax(24rem, 1fr))">
      {segments
        ?.filter((s) => s.isFavorite)
        .map((s) => (
          <SegmentView key={s.id} segment={s} />
        ))}
    </Grid>
  );
};
