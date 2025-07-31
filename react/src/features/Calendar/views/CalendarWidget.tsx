import { useEffect } from "react";

import {
  Box,
  BoxProps,
  Grid,
  HStack,
  Icon,
  IconButton,
  Separator,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";

import { LuChevronLeft, LuChevronRight, LuCircle } from "react-icons/lu";

import { useAppDispatch } from "@/app/store";
import { useAuth } from "@/features/auth/slice";

import { useBirthdays } from "../api";
import { actions, useSliceSelector } from "../slice";
import { monthDays, MONTHS_NAMES, WEEKDAYS_NAMES } from "../utils";

export const CalendarWidget = () => {
  const dispatch = useAppDispatch();
  const year = useSliceSelector(({ year }) => year);
  const month = useSliceSelector(({ month }) => month);

  const { orgId } = useAuth();
  const birthdays = useBirthdays({ orgId });

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
          {MONTHS_NAMES[month - 1]} {year}
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
        {WEEKDAYS_NAMES.map((weekday) => (
          <Text key={weekday} fontWeight="semibold" px={2}>
            {weekday}
          </Text>
        ))}
        {monthDays(year, month).map(({ day, isNow }, i) => (
          <Day
            key={i}
            day={day}
            isNow={isNow}
            hasBirthday={
              day ? (birthdays[`${month}/${day}`]?.length ?? 0) > 0 : false
            }
          />
        ))}
      </Grid>
    </Stack>
  );
};

const Day = ({
  day,
  isNow = false,
  hasBirthday = false,
  ...rest
}: { day?: number; isNow?: boolean; hasBirthday?: boolean } & Omit<
  BoxProps,
  "children"
>) => {
  const dispatch = useAppDispatch();
  const year = useSliceSelector(({ year }) => year);
  const month = useSliceSelector(({ month }) => month);
  const isSelected = useSliceSelector((state) => state.day === day);

  return (
    <Box
      position="relative"
      p={2}
      bg={isNow ? "yellow" : isSelected ? "gray.400" : undefined}
      _hover={{ bg: "gray.300" }}
      color={isNow ? "black" : undefined}
      borderRadius="full"
      onClick={
        day ? () => dispatch(actions.dateSet({ year, month, day })) : undefined
      }
      transition="0.3s"
      cursor="pointer"
      {...rest}
    >
      {day}
      <Show when={hasBirthday}>
        <Icon position="absolute" top="-5%" right="-5%" w={1.5} h={1.5}>
          <LuCircle fill="white" />
        </Icon>
      </Show>
    </Box>
  );
};
