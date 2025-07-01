import { useAppDispatch } from "@/app/store.ts";
import { Button } from "@/shared/comps/Button.tsx";
import { Checkbox } from "@/shared/comps/Checkbox.tsx";
import {
  Field,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  Show,
  Stack,
  Textarea,
  Wrap,
} from "@chakra-ui/react";
import { useFormStatus } from "react-dom";
import { LuShuffle, LuTrash2 } from "react-icons/lu";
import {
  actions,
  useIsReadOnly,
  useQuestionOrder,
  useQuestionSelector,
  useSliceSelector,
} from "../slice";

export const QuestionInfo = ({ qid }: { qid: number }) => {
  return (
    <Stack mt={9} mb={2} gap={5}>
      <QuestionHeading qid={qid} />
      <QuestionTextField qid={qid} />
      <Wrap gap={5}>
        <QuestionCheckbox
          qid={qid}
          attr="isMultipleChoice"
          label="Несколько вариантов"
        />
        <QuestionCheckbox
          qid={qid}
          attr="isRequired"
          label="Обязательный опрос"
        />
        <QuestionCheckbox
          qid={qid}
          attr="acceptFreeChoice"
          label="Свободный ответ"
        />
        <SpecifyMinMaxCheckbox qid={qid} />
      </Wrap>
      <QuestionChoiceLimits qid={qid} />
      <QuestionControls qid={qid} />
    </Stack>
  );
};

const QuestionHeading = ({ qid }: { qid: number }) => {
  const order = useQuestionOrder(qid);

  return (
    <Heading as="h3" fontSize="md">
      Вопрос {order}
    </Heading>
  );
};

const QuestionTextField = ({ qid }: { qid: number }) => {
  const dispatch = useAppDispatch();
  const text = useQuestionSelector(qid, (q) => q?.text ?? "");

  return (
    <Field.Root>
      <Field.Label fontSize="sm" color="gray.2" ml={2}>
        Текст вопроса
      </Field.Label>
      <Textarea
        required
        borderRadius={2}
        borderColor="gray.1"
        rows={2}
        resize="none"
        value={text}
        onChange={(e) =>
          dispatch(
            actions.questionUpdated({
              qid: qid,
              update: { text: e.target.value },
            }),
          )
        }
      />
    </Field.Root>
  );
};

const QuestionCheckbox = ({
  qid,
  attr,
  label,
}: {
  qid: number;
  attr:
    | "isMultipleChoice"
    | "isRequired"
    | "acceptFreeChoice"
    | "specifyMinMax";
  label: string;
}) => {
  const dispatch = useAppDispatch();
  const value = useQuestionSelector(qid, (q) => !!(q && q[attr]));

  return (
    <Checkbox
      label={label}
      checked={value}
      onCheckedChange={(e) =>
        dispatch(
          actions.questionUpdated({
            qid: qid,
            update: { [attr]: !!e.checked },
          }),
        )
      }
    />
  );
};

const SpecifyMinMaxCheckbox = ({ qid }: { qid: number }) => {
  const hasSeveralChoices = useQuestionSelector(qid, (q) =>
    q ? q.cids.length - 1 > 1 : false,
  );

  if (!hasSeveralChoices) return;

  return (
    <QuestionCheckbox
      qid={qid}
      attr="specifyMinMax"
      label="Минимальное и максимальное число ответов"
    />
  );
};

const QuestionChoiceLimits = ({ qid }: { qid: number }) => {
  const specifyMinMax = useQuestionSelector(qid, (q) => !!q?.specifyMinMax);

  if (!specifyMinMax) return;

  return (
    <Grid templateColumns="1fr 1fr" gapX={4}>
      <QuestionChoiceLimit qid={qid} attr="minChoices" label="Минимально" />
      <QuestionChoiceLimit qid={qid} attr="maxChoices" label="Максимально" />
    </Grid>
  );
};

const QuestionChoiceLimit = ({
  qid,
  attr,
  label,
}: {
  qid: number;
  attr: "minChoices" | "maxChoices";
  label: string;
}) => {
  const dispatch = useAppDispatch();
  const n = useQuestionSelector(qid, (q) => q?.cids.length ?? 0);
  const value = useQuestionSelector(
    qid,
    (q) => (q && q[attr]?.toString()) ?? "",
  );

  return (
    <Field.Root>
      <Field.Label fontSize="sm" color="gray.2" ml={2}>
        {label}
      </Field.Label>
      <Input
        type="number"
        min={2}
        max={n - 1}
        borderRadius={2}
        borderColor="gray.1"
        value={value}
        onChange={(e) =>
          dispatch(
            actions.questionUpdated({
              qid,
              update: { [attr]: Number(e.target.value) || undefined },
            }),
          )
        }
      />
    </Field.Root>
  );
};

const QuestionControls = ({ qid }: { qid: number }) => {
  const dispatch = useAppDispatch();
  const numQuestions =
    useSliceSelector((state) => state.mode && state.qids.length) ?? 0;
  const dependencyRule = useQuestionSelector(qid, (q) => q?.dependencyRule);
  const { pending } = useFormStatus();
  const readOnly = useIsReadOnly();

  if (readOnly) return;

  return (
    <HStack gap={4}>
      <Show when={numQuestions > 1}>
        <Button
          variant="ghost"
          px={2}
          disabled={pending}
          onClick={() => dispatch(actions.questionRemoved({ qid }))}
        >
          <Icon>
            <LuTrash2 />
          </Icon>
          Удалить вопрос
        </Button>
      </Show>
      <Button
        variant="ghost"
        px={2}
        disabled={pending}
        onClick={() => {
          if (dependencyRule) {
            dispatch(
              actions.questionUpdated({
                qid,
                update: { dependencyRule: { id: 0, questionId: 0 } },
              }),
            );
          }
        }}
      >
        <Icon>
          <LuShuffle />
        </Icon>
        {dependencyRule ? "Удалить связь" : "Добавить связь"}
      </Button>
    </HStack>
  );
};
