import { Box, Heading, Text, HStack, Show, Stack } from "@chakra-ui/react";

import { Question } from "../../types";
import { useIsShown } from "../slice";

import { ChoiceCountNotice, ValidationNotice } from "./notices.tsx";
import {
  ChoiceListMultiple,
  ChoiceListSingle,
  FreeChoice,
} from "./choices.tsx";

export const QuestionView = ({ q, num }: { q: Question; num: number }) => {
  const ribbonBg = !q.isMultipleChoice ? "blue.1" : "orange.1";

  const isShown = useIsShown(q.id);
  if (!isShown) return;

  return (
    <HStack
      overflow="hidden"
      align="stretch"
      borderRadius={1}
      boxShadow="0 0 5px 0 rgba(0, 0, 0, 0.2)"
    >
      <Box w={2} bg={ribbonBg} />
      <Stack px="6" py="5" gap={4} flexGrow={1}>
        <Box>
          <Heading as="h3" fontSize="larger">
            {num}. {q.text}
            <Show when={q.isRequired}>
              <Text as="span" color="red">
                {" *"}
              </Text>
            </Show>
          </Heading>
          <ChoiceCountNotice q={q} />
        </Box>

        <Stack gap={3}>
          {q.isMultipleChoice ? (
            <ChoiceListMultiple q={q} />
          ) : (
            <ChoiceListSingle q={q} />
          )}

          <Show when={q.acceptFreeChoice}>
            <FreeChoice q={q} />
          </Show>

          <ValidationNotice q={q} />
        </Stack>
      </Stack>
    </HStack>
  );
};
