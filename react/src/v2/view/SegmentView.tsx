import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/slice";

import { css } from "@styled-system/css";
import { BoxProps, Grid, HStack, Stack, styled } from "@styled-system/jsx";
import { flex, hstack, stack } from "@styled-system/patterns";

import { SaxArrowRightLinear } from "@meysam213/iconsax-react";

import { toggleFavoriteSegment } from "@api/segment";
import { Button } from "@view/Button";

import { FavToggle } from "./FavToggle";
import { ProfileCard } from "./ProfileCard";
import { Segment } from "@api/segment/types";

export type SegmentProps = Omit<BoxProps, "children"> & {
  full?: boolean;
  segment: Segment;
};

export const SegmentView = ({ full, segment: s, ...rest }: SegmentProps) => {
  const auth = useAuth();

  const toggle = () => toggleFavoriteSegment(auth.token, s.id);

  if (full) {
    return (
      <styled.article
        className={stack({ gap: 4 })}
        shadow={{ base: "S", _hover: "M" }}
        borderRadius="8px" // FIXME
        px={6}
        py={4}
        borderWidth="1px"
        borderColor="Grayscale/SpacerLight"
      >
        <HStack>
          <FavToggle fav={s.isFavorite} toggle={toggle} />
        </HStack>
        <Stack gap={2}>
          <styled.h1 fontSize="Headline/H4" fontWeight="semibold">
            {s.name}
          </styled.h1>
          <styled.p lineClamp="3">{s.description}</styled.p>
        </Stack>
        <Grid gridTemplateColumns="1fr auto" gap={4} mt="auto">
          <ProfileCard
            subtitle="Ответственный"
            userId={s.supervisor ?? null}
            fallbackName={s.supervisorFallback ?? undefined}
          />
          <Link
            to={s.url}
            target="_blank"
            className={flex({ align: "center" })}
          >
            <Button
              size="L"
              variant="text"
              display="flex"
              alignItems="center"
              gap={2}
              justifySelf="end"
            >
              <span>Подробнее</span>
              <SaxArrowRightLinear
                className={css({ w: "1.125rem", h: "1.125rem" })}
              />
            </Button>
          </Link>
        </Grid>
      </styled.article>
    );
  }

  return (
    <styled.article
      className={hstack({ gap: 4 })}
      shadow={{ base: "S", _hover: "M" }}
      borderRadius="8px" // FIXME
      p={4}
      {...rest}
    >
      <FavToggle fav={s.isFavorite} toggle={toggle} />
      <styled.a
        href={s.url}
        target="_blank"
        flexGrow="1"
        className={stack({ gap: 1 })}
      >
        <styled.h1 fontWeight="semibold" fontSize="Headline/H4" lineClamp={1}>
          {s.name}
        </styled.h1>
      </styled.a>
    </styled.article>
  );
};
