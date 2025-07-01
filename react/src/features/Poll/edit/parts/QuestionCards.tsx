import React from "react";

import { Reorder, useDragControls, DragControls } from "motion/react";

import { Stack, Grid, Icon, Box } from "@chakra-ui/react";

import { LuGripHorizontal } from "react-icons/lu";

import { useSliceSelector, useIsReadOnly, actions } from "../slice";

import { ChoicesCards } from "./ChoiceCards";
import { QuestionInfo } from "./QuestionInfo";
import { ShadowBox } from "./ShadowBox";

import { useAppDispatch } from "@/app/store";
import { useFormStatus } from "react-dom";

export const QuestionCards = () => {
  const dispatch = useAppDispatch();
  const qids = useSliceSelector((state) => (state.mode ? state["qids"] : []));
  const { pending } = useFormStatus();

  return (
    <Stack asChild gap={3}>
      <Reorder.Group
        axis="y"
        values={pending ? [] : qids}
        onReorder={(order) => dispatch(actions.questionsReordered(order))}
      >
        {qids.map((qid) => (
          <QuestionCardReorder key={qid} qid={qid} />
        ))}
      </Reorder.Group>
    </Stack>
  );
};

const QuestionCardReorder = ({ qid }: { qid: number }) => {
  const controls = useDragControls();
  const { pending } = useFormStatus();
  const readOnly = useIsReadOnly();

  return (
    <Reorder.Item
      value={qid}
      dragListener={false}
      dragControls={controls}
      layout="position"
    >
      <QuestionCard
        qid={qid}
        controls={readOnly || pending ? undefined : controls}
      />
    </Reorder.Item>
  );
};

const QuestionCard = React.memo(function QuestionCard({
  qid,
  controls,
}: {
  qid: number;
  controls?: DragControls;
}) {
  return (
    <ShadowBox pt={2} px={16} pb={8}>
      <Grid templateColumns="1fr auto 1fr" gapX={4}>
        <QuestionInfo qid={qid} />

        <Stack align="center" mx={16}>
          <Icon
            _hover={{ cursor: controls ? "grabbing" : undefined }}
            color="gray.1"
            onPointerDown={(e) => controls && controls.start(e)}
          >
            <LuGripHorizontal />
          </Icon>
          <Box w={0} h="full" borderWidth={1} borderColor="gray.8" />
        </Stack>

        <ChoicesCards qid={qid} mt={9} mb={2} />
      </Grid>
    </ShadowBox>
  );
});
