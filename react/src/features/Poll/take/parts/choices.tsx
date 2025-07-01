import { useCallback } from "react";

import {
  CheckboxGroup,
  Field,
  Fieldset,
  Input,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";

import { useAppDispatch } from "@/app/store.ts";

import { Checkbox } from "@/shared/comps/Checkbox.tsx";

import { Question } from "../../types.ts";
import {useAnswerSelector, useIsReadOnly} from "../slice.ts";
import { slice } from "../slice";

export const ChoiceListMultiple = ({ q }: { q: Question }) => {
  const dispatch = useAppDispatch();
  const readOnly = useIsReadOnly();
  const choices = useAnswerSelector(q.id, (q) => q.choices) ?? [];

  const check = (choiceId: number, checked: boolean) =>
    dispatch(
      slice.actions.multipleChosen({
        qid: q.id,
        operation: checked ? "add" : "remove",
        choiceId,
      }),
    );

  return (
    <Fieldset.Root>
      <CheckboxGroup
        readOnly={readOnly}
        value={choices.map((id) => id.toString())}
      >
        <Fieldset.Content gap={3}>
          {q.choices.map((c) => (
            <Checkbox
              key={c.id}
              value={c.id.toString()}
              label={c.text}
              onCheckedChange={({ checked }) => check(c.id, !!checked)}
            />
          ))}
        </Fieldset.Content>
      </CheckboxGroup>
    </Fieldset.Root>
  );
};

export const ChoiceListSingle = ({ q }: { q: Question }) => {
  const dispatch = useAppDispatch();
  const readOnly = useIsReadOnly();
  const choices = useAnswerSelector(q.id, (q) => q.choices) ?? [];

  const onValueChange = useCallback(
    ({ value }: { value: string | null }) =>
      dispatch(
        slice.actions.singleChosen({
          qid: q.id,
          choiceId: Number(value),
        }),
      ),
    [dispatch, q.id],
  );

  return (
    <RadioGroup.Root
      variant="outline"
      value={choices[0]?.toString() ?? ""}
      onValueChange={onValueChange}
      readOnly={readOnly}
    >
      <Stack gap={3}>
        {q.choices.map((c) => (
          <RadioGroup.Item key={c.id} value={c.id.toString()} gap={2}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator
              w={4}
              h={4}
              _checked={{ color: "blue.1", borderColor: "blue.1" }}
            />
            <RadioGroup.ItemText>{c.text}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </Stack>
    </RadioGroup.Root>
  );
};

export const FreeChoice = ({ q }: { q: Question }) => {
  const dispatch = useAppDispatch();
  const readOnly = useIsReadOnly();
  const freeChoice = useAnswerSelector(q.id, (q) => q.freeChoice) ?? "";

  return (
    <Field.Root required={q.isRequired && q.choices.length === 0}>
      <Input
        outline="none"
        borderWidth={0}
        borderBottomWidth={1}
        borderRadius={0}
        borderColor="gray.1"
        px={0}
        placeholder="Свой вариант"
        _placeholder={{ color: "gray.7" }}
        disabled={readOnly}
        value={freeChoice}
        onChange={({ target }) =>
          dispatch(
            slice.actions.freeChoiceTyped({
              qid: q.id,
              isMultipleChoice: q.isMultipleChoice,
              text: target.value,
            }),
          )
        }
      />
    </Field.Root>
  );
};
