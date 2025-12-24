import { GridProps, Grid, Flex, Stack } from "@styled-system/jsx";
import { css } from "@styled-system/css";

import {
  SaxArrowLeftOutline,
  SaxArrowRight1Outline,
} from "@meysam213/iconsax-react";

import { IconButton } from "@ui/atoms/buttons";

export const PagedCardsGallery = ({
  children,
  size,
  ...controlProps
}: React.ComponentProps<typeof CardsControls> & {
  children: React.ReactNode;
}) => {
  return (
    <Stack gap={3}>
      <CardsControls size={size} {...controlProps} />
      <Cards size={size}>{children}</Cards>
    </Stack>
  );
};

const Cards = ({ size, ...rest }: { size: number } & GridProps) => {
  return (
    <Grid
      gap={8}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      {...rest}
    />
  );
};

const CardsControls = ({
  len1,
  len2,
  size,
  cur,
  setCur,
}: {
  len1: number | undefined;
  len2: number | undefined;
  size: number;
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
          (len1 < size && len2 === 0) ||
          (len2 < size && cur % size === size - 1)
        }
        onClick={() => setCur(cur + 1)}
      >
        <SaxArrowRight1Outline className={css({ w: 6, h: 6 })} />
      </IconButton>
    </Flex>
  );
};
