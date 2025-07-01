import { ReactNode, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { Grid, Heading, Show, Stack, Text } from "@chakra-ui/react";

import { useAppDispatch } from "@/app/store.ts";

import { useAuth } from "@/features/auth/slice.ts";
import { useIntParam } from "@/shared/hooks/useIntParam.ts";

import { PageHeading } from "@/features/App/comps/PageHeading.tsx";
import { Button } from "@/shared/comps/Button.tsx";

import { PollOpenedIcon } from "@/shared/icons/poll/PollOpenedIcon.tsx";
import { PollSubmittedIcon } from "@/shared/icons/poll/PollSubmittedIcon.tsx";

import { useFetchPoll } from "../../api.ts";
import { useFetchUserAnswers } from "../api.ts";
import { submitPoll, useSliceSelector } from "../slice.ts";

import { slice } from "../slice";

import { QuestionView } from "./QuestionView.tsx";
import { mutate } from "swr";
import { useFormStatus } from "react-dom";

export const PollView = ({
  action,
  userId,
  embed,
}: {
  action: "take" | "view";
  userId?: string;
  embed?: boolean;
}) => {
  const pollId = useIntParam("pollId");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: poll, error } = useFetchPoll(pollId);
  const { data: answers, error: errorAnswers } = useFetchUserAnswers(
    pollId,
    userId,
  );
  const mode = useSliceSelector((state) => state.mode);
  const auth = useAuth();

  userId ??= auth.userId;

  useEffect(() => {
    if (!poll || !answers) return;
    if (action === "take") {
      if (answers.submittedAt) {
        dispatch(slice.actions.submitted());
      }
      if (!answers.submittedAt && mode !== "take" && mode !== "submitted") {
        dispatch(slice.actions.opened(poll));
      }
    } else if (action === "view") {
      if (!answers.submittedAt) {
        navigate(`/polls/take/${poll.id}`, { replace: true });
      }
      if (!answers.submittedAt || mode === "view") return;
      dispatch(
        slice.actions.viewed({
          poll,
          userId,
          answers: answers.answers,
        }),
      );
    }
  }, [dispatch, navigate, mode, poll, answers, action, userId]);

  if (!poll || !answers || !mode) return;

  if (error) {
    console.error(error);
    return;
  }

  if (errorAnswers) {
    console.error(error);
    return;
  }

  if (mode === "opened") {
    return (
      <PollPreview
        title={poll.name}
        desc={poll.description}
        icon={<PollOpenedIcon />}
        btnText="Начать опрос"
        onClick={() => dispatch(slice.actions.taken())}
      />
    );
  }

  if (mode === "submitted") {
    return <PollPreviewSubmitted pollId={poll.id} />;
  }

  return (
    <form
      action={async () => {
        await dispatch(submitPoll());
        await mutate(`/polls/${poll.id}/answers/${userId}/`);
      }}
    >
      {embed ? undefined : action === "view" ? (
        <PageHeading title="Просмотр опроса" />
      ) : (
        action === "take" && (
          <PageHeading title="Прохождение опроса">
            <SubmitButton />
          </PageHeading>
        )
      )}

      <Show when={!embed}>
        <Heading as="h2" fontSize="md" mb="3">
          {poll.name}
        </Heading>
        <Text>{poll.description}</Text>
      </Show>

      <Stack gap="5" mt="5">
        {poll.questions.map((q, i) => (
          <QuestionView key={q.id} num={i + 1} q={q} />
        ))}
      </Stack>
    </form>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="solid" disabled={pending}>
      Завершить опрос
    </Button>
  );
};

const PollPreview = ({
  title,
  desc,
  btnText,
  disabled,
  onClick,
  icon,
}: {
  title: string;
  desc: string;
  btnText: string;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
}) => {
  return (
    <>
      <PageHeading title="Прохождение опроса" />
      <Grid
        h="full"
        templateColumns="1fr 3fr 1fr 2fr"
        templateRows="2fr 1fr"
        alignItems="center"
      >
        <div></div>

        <Stack gap={14}>
          <Stack color="blue.7">
            <Heading as="h2" fontSize="3xl">
              {title}
            </Heading>
            <Text>{desc}</Text>
          </Stack>
          <Button variant="solid" w="fit" disabled={disabled} onClick={onClick}>
            {btnText}
          </Button>
        </Stack>

        {icon}
        <div></div>
      </Grid>
    </>
  );
};

const PollPreviewSubmitted = ({ pollId }: { pollId: number }) => {
  const navigate = useNavigate();
  const { pending } = useFormStatus();

  return (
    <PollPreview
      title="Вы завершили опрос!"
      desc="Благодарим за выделенное время и обратную связь."
      icon={<PollSubmittedIcon />}
      btnText="Посмотреть свои ответы"
      disabled={pending}
      onClick={() => navigate(`/polls/view/${pollId}`, { replace: true })}
    />
  );
};
