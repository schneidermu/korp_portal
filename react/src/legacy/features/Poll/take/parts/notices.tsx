import { HStack, Icon, Text } from "@chakra-ui/react";
import { LuCircleAlert } from "react-icons/lu";

import { Question } from "../../types.ts";
import { useSliceSelector } from "../slice.ts";
import { useIsValidated, useQuestionValidation } from "../slice.ts";
import { choiceCountNoticeText } from "../../utils.ts";

export const ChoiceCountNotice = ({ q }: { q: Question }) => {
  const mode = useSliceSelector((state) => state.mode);
  const text = choiceCountNoticeText(q);

  if (!text || mode !== "take") return;

  return (
    <Text fontSize="sm" color="gray.6" fontWeight={400}>
      {text}
    </Text>
  );
};

export const ValidationNotice = ({ q }: { q: Question }) => {
  const isValidated = useIsValidated(q.id);
  const mode = useSliceSelector((state) => state.mode);
  const errorText = useQuestionValidation(q);

  if (!isValidated || !errorText || mode !== "take") return;

  return (
    <HStack color="red.2" fontSize="sm">
      <Icon w="4" h="4">
        <LuCircleAlert />
      </Icon>
      {errorText}
    </HStack>
  );
};
