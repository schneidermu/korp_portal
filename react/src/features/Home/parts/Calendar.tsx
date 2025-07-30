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
import { monthDays, MONTHS, WEEKDAYS } from "@/shared/utils/calendar.ts";

export const Calendar = () => {
  const dispatch = useAppDispatch();
  const year = useSliceSelector(({ year }) => year);
  const month = useSliceSelector(({ month }) => month);

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
        gapX={2}
        gapY={1}
        cursor="default"
      >
        {WEEKDAYS.map((weekday) => (
          <Text key={weekday} fontWeight="semibold">
            {weekday}
          </Text>
        ))}
        {monthDays(year, month).map(({ day, isNow }, i) => (
          <Box
            key={i}
            p={2}
            bg={isNow ? "yellow" : undefined}
            color={isNow ? "black" : undefined}
            borderRadius="full"
          >
            {day}
          </Box>
        ))}
      </Grid>
    </Stack>
  );
};
