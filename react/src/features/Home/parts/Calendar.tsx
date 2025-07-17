import { useEffect } from "react";

import {
  Box,
  Grid,
  HStack,
  IconButton,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";

import { useAppDispatch } from "@/app/store";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { actions, useSliceSelector } from "../slice";

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

export const Calendar = () => {
  const dispatch = useAppDispatch();
  const year = useSliceSelector(({ year }) => year);
  const month = useSliceSelector(({ month }) => month);

  const firstWeekday = new Date(year, month, 1).getDay();

  const days = Array(daysInMonth(year, month))
    .fill(0)
    .map((_, i) => i + 1);

  useEffect(() => {
    dispatch(actions.dateReset());
  }, [dispatch]);

  return (
    <Stack
      pl={3}
      pr={6}
      pt={5}
      pb={8}
      shadow="0 4px 4px 0 rgba(0, 0, 0, 25%)"
      bg="blue.9"
      borderRadius={2}
      color="white"
    >
      <HStack justify="space-between">
        <Text fontSize="xl" fontWeight="semibold">
          {MONTHS[month]} {year}
        </Text>
        <HStack>
          <IconButton
            minW={0}
            h="fit"
            variant="ghost"
            color="white"
            _hover={{ bg: "blue.2" }}
            onClick={() => dispatch(actions.monthChanged(-1))}
          >
            <LuChevronLeft />
          </IconButton>
          <IconButton
            minW={0}
            h="fit"
            variant="ghost"
            color="white"
            _hover={{ bg: "blue.2" }}
            onClick={() => dispatch(actions.monthChanged(+1))}
          >
            <LuChevronRight />
          </IconButton>
        </HStack>
      </HStack>
      <Separator />
      <Grid
        templateColumns="repeat(7, 1fr)"
        templateRows="repeat(7, 1fr)"
        fontSize="sm"
        textAlign="right"
        gapX={5}
        gapY={3}
        cursor="default"
      >
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} fontWeight="semibold">
            {weekday}
          </Text>
        ))}
        {Array((firstWeekday - 1 + 7) % 7)
          .fill(0)
          .map((_, i) => (
            <Box key={`skip/${i}`} />
          ))}
        {days.map((day) => (
          <Box key={day}>{day}</Box>
        ))}
      </Grid>
    </Stack>
  );
};
