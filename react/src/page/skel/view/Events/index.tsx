import { useContext, useState } from "react";

import { Temporal } from "temporal-polyfill";

import { css } from "@styled-system/css";
import { Box, Grid, GridProps, Stack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import {
  SaxArrowLeft3Linear,
  SaxArrowRight3Linear,
  SaxCakeOutline,
  SaxCalendar1Outline,
} from "@meysam213/iconsax-react";

import { useAuth } from "@legacy/features/auth/slice";

import { useFetchUsers } from "@api/user";
import { formatDate } from "@util/date";
import { IconButton } from "@ui/atoms/buttons";

import { DrawerContext } from "@ui/molecules/navigation";
import { birthdays, monthDays, MONTHS_NAMES, WEEKDAYS_NAMES } from "./utils";

export const Events = () => {
  const ctx = useContext(DrawerContext);
  const now = Temporal.Now.plainDateISO();
  const [date, setDate] = useState(now);

  const auth = useAuth();
  const {
    data: { users },
  } = useFetchUsers({ orgId: auth.orgId });

  if (!ctx.isOpen || ctx.isAnimating) {
    return (
      <Box p={3}>
        <SaxCalendar1Outline className={css({ w: 5, h: 5 })} />
      </Box>
    );
  }

  return (
    <article className={stack({ gap: 4 })}>
      <styled.h1
        color="Grayscale/Black"
        fontSize="Headline/H4"
        fontWeight="semibold"
      >
        События
      </styled.h1>
      <Calendar date={date} setDate={setDate} />
      <Stack gap={0}>
        {birthdays({ users, date }).map(([date, user], i) => (
          <EventView
            key={user.id}
            date={date}
            name={`${user.firstName} ${user.lastName}`}
            borderTopWidth={i > 0 ? "1px" : undefined}
            borderColor="Grayscale/SpacerLight"
          />
        ))}
      </Stack>
    </article>
  );
};

const Calendar = ({
  date,
  setDate,
}: {
  date: Temporal.PlainDate;
  setDate: (a: React.SetStateAction<Temporal.PlainDate>) => void;
}) => {
  return (
    <Stack
      px={8}
      py={9}
      gap={3}
      borderWidth="1px"
      borderColor="Grayscale/SpacerLight"
      borderRadius="25px" /* FIXME */
      shadow="S"
      userSelect="none"
    >
      <Grid gridTemplateColumns="auto 1fr auto">
        <IconButton
          color="Corporate/Accent"
          onClick={() => setDate(date.subtract({ months: 1 }))}
        >
          <SaxArrowLeft3Linear className={css({ w: 5, h: 5 })} />
        </IconButton>
        <styled.h1 color="Grayscale/Black" textAlign="center">
          {MONTHS_NAMES[date.month - 1]} {date.year}
        </styled.h1>
        <IconButton
          color="Corporate/Accent"
          onClick={() => setDate(date.add({ months: 1 }))}
        >
          <SaxArrowRight3Linear className={css({ w: 5, h: 5 })} />
        </IconButton>
      </Grid>
      <Grid
        gridTemplateColumns="repeat(7, 1fr)"
        color="Grayscale/Border"
        pb={2}
        borderBottomWidth="1px"
        borderColor="Grayscale/SpacerLight"
        fontWeight="light"
        textAlign="center"
        gap={0}
      >
        {WEEKDAYS_NAMES.map((w) => (
          <Box key={w}>{w}</Box>
        ))}
      </Grid>
      <Grid
        gridTemplateColumns="repeat(7, 1fr)"
        gridTemplateRows="repeat(6, 1fr)"
        fontSize="Body/S"
        textAlign="center"
        gap={0}
        lineHeight="1.4"
      >
        {monthDays(date).map(
          ({ day, isCurrentMonth, isCurrentDay, isToday }, i) => (
            <styled.button
              key={i}
              cursor="pointer"
              disabled={!isCurrentMonth}
              onClick={() => setDate(date.with({ day }))}
              py={2}
              borderRadius="4px" /* FIXME */
              bg={isCurrentDay ? "Corporate/Accent" : undefined}
              textDecoration={isToday ? "underline" : undefined}
              color={
                isCurrentDay
                  ? "white"
                  : isCurrentMonth
                    ? "Grayscale/Black"
                    : "Grayscale/Border"
              }
            >
              {day}
            </styled.button>
          ),
        )}
      </Grid>
    </Stack>
  );
};

const EventView = ({
  name,
  date,
  ...rest
}: {
  name: string;
  date: Temporal.PlainDate;
} & GridProps) => {
  return (
    <Grid p={3} gridTemplateColumns="auto 1fr" alignItems="center" {...rest}>
      <Box
        p={2}
        gridRow="span 2"
        borderRadius="full"
        bg="Corporate/Accent"
        borderWidth="1px"
        borderColor="Corporate/Accent"
        color="white"
      >
        <SaxCakeOutline className={css({ w: 5, h: 5 })} />
      </Box>
      <Box>{name}</Box>
      <Box>{formatDate(date, { month: "short", weekday: "short" })}</Box>
    </Grid>
  );
};
