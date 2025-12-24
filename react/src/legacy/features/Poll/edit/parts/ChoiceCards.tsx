import React from "react";

import { DragControls, Reorder, useDragControls } from "motion/react";

import {
  Center,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Stack,
  StackProps,
} from "@chakra-ui/react";

import { LuGripHorizontal, LuX } from "react-icons/lu";

import { useAppDispatch } from "@app/store";
import { index } from "@legacy/shared/utils";

import { actions, useIsReadOnly, useQuestionSelector } from "../slice";
import { useFormStatus } from "react-dom";
import { Button } from "@legacy/shared/comps/Button";

export const ChoicesCards = ({
  qid,
  ...rest
}: StackProps & { qid: number }) => {
  const dispatch = useAppDispatch();
  const cids = useQuestionSelector(qid, (q) => q?.cids ?? []);

  return (
    <Stack gap={5} {...rest}>
      <Heading as="h4" fontSize="md">
        Варианты ответа
      </Heading>
      <Stack asChild gap={3}>
        <Reorder.Group
          axis="y"
          values={cids}
          onReorder={(order) =>
            dispatch(actions.choicesReordered({ qid, order }))
          }
        >
          {cids.map((cid) => (
            <ChoiceCardReorder key={cid} qid={qid} cid={cid} />
          ))}
        </Reorder.Group>
      </Stack>
      <ChoiceAddButton qid={qid} />
    </Stack>
  );
};

const ChoiceCardReorder = ({ qid, cid }: { qid: number; cid: number }) => {
  const controls = useDragControls();
  const { pending } = useFormStatus();
  const readOnly = useIsReadOnly();

  return (
    <Reorder.Item value={cid} dragListener={false} dragControls={controls}>
      <ChoiceCard
        qid={qid}
        cid={cid}
        controls={readOnly || pending ? undefined : controls}
      />
    </Reorder.Item>
  );
};

const ChoiceCard = React.memo(function ChoiceCard({
  qid,
  cid,
  controls,
}: {
  qid: number;
  cid: number;
  controls?: DragControls;
}) {
  const dispatch = useAppDispatch();
  const text = useQuestionSelector(qid, (q) => q?.choices[cid] ?? "");
  const isLastChoice = useQuestionSelector(qid, (q) =>
    q ? index(q.cids, -1) === cid : false,
  );
  const { pending } = useFormStatus();
  const readOnly = useIsReadOnly();

  if (isLastChoice && text === "" && readOnly) return;

  return (
    <InputGroup
      px={0}
      startElement={
        <Center
          w="full"
          h="full"
          _hover={{ cursor: controls ? "grabbing" : undefined }}
          onPointerDown={(e) => controls && controls.start(e)}
          pointerEvents="all"
        >
          <Icon color="gray.1">
            <LuGripHorizontal />
          </Icon>
        </Center>
      }
      endElement={
        !readOnly && (
          <IconButton
            variant="plain"
            color="gray.1"
            disabled={pending}
            onClick={() => dispatch(actions.choiceRemoved({ qid, cid: cid }))}
          >
            <LuX />
          </IconButton>
        )
      }
    >
      <Input
        variant="flushed"
        placeholder="Введите текст варианта"
        required={text !== "" || !isLastChoice}
        value={text}
        onChange={(e) =>
          dispatch(
            actions.choiceUpdated({ qid, cid: cid, text: e.target.value }),
          )
        }
      />
    </InputGroup>
  );
});

const ChoiceAddButton = ({ qid }: { qid: number }) => {
  const dispatch = useAppDispatch();
  const isLastChoiceEmpty = useQuestionSelector(qid, (q) =>
    q ? q.choices[index(q.cids, -1)] === "" : true,
  );
  const readOnly = useIsReadOnly();
  const { pending } = useFormStatus();

  if (isLastChoiceEmpty || readOnly) return;

  return (
    <Button
      variant="ghost"
      fontSize="sm"
      w="fit"
      px={2}
      disabled={pending}
      onClick={() => dispatch(actions.choiceAdded({ qid }))}
    >
      Добавить ещё вариант
    </Button>
  );
};
