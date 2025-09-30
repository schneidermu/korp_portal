import * as R from "radashi";

import { Box, BoxProps, Center, Grid, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { useFetchSegments } from "@api/segment";
import { Segment } from "@api/segment/types";
import { SegmentView } from "@view/SegmentView";

export default function SegmentsPage() {
  const { data: segments } = useFetchSegments();

  const grouped = R.group(segments ?? [], (s) => s.groupName);

  if (!segments) return;

  return (
    <Stack gap={14}>
      <styled.h1 fontSize="Headline/H1">Сегменты</styled.h1>
      <GroupsNav />
      {R.alphabetical(Object.keys(grouped), (x) => x).map(
        (group) =>
          grouped[group] && (
            <Section
              key={grouped[group][0].groupId}
              name={group}
              segments={grouped[group] ?? []}
            />
          ),
      )}
    </Stack>
  );
}

const GroupsNav = () => {
  const { data: segments } = useFetchSegments();

  const groups = R.alphabetical(
    R.unique(segments?.map((s) => s.groupName) ?? []),
    (x) => x,
  );

  return (
    <styled.nav
      display="grid"
      gridTemplateColumns="repeat(auto-fit, minmax(15rem, 1fr))"
      gridAutoRows="1fr"
      /* NOTE: This with the negative margin on the items
       * hides right borders for the last child of each row. */
      overflow="hidden"
    >
      {groups.map((g) => (
        <Box
          py={4}
          _hover={{
            borderColor: "Corporate/Accent",
            borderBottomWidth: "3px",
            paddingBottom: "-3px",
            borderTopWidth: 0,
          }}
          borderColor="Grayscale/SpacerLight"
          borderBottomWidth="1px"
          borderTopColor="transparent"
          borderTopWidth="2px"
          mr="-1px"
        >
          <Center
            h="full"
            px={6}
            textAlign="center"
            fontSize="Body/L"
            lineHeight={1.3}
            borderColor="Grayscale/SpacerLight"
            borderRightWidth="1px"
          >
            {g}
          </Center>
        </Box>
      ))}
    </styled.nav>
  );
};

const Section = ({
  name,
  segments,
}: {
  name: string;
  segments: Segment[];
} & Omit<BoxProps, "children">) => {
  return (
    <styled.section className={stack({ gap: 9 })}>
      <styled.h1 fontSize="Headline/H2">{name}</styled.h1>
      <Grid gridTemplateColumns="repeat(auto-fit, minmax(22rem, 1fr))" gap={30}>
        {segments.map((s) => (
          <SegmentView key={s.id} full segment={s} />
        ))}
      </Grid>
    </styled.section>
  );
};
