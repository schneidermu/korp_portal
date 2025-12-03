import { ReactNode, useEffect } from "react";

import { Option as O } from "effect";

import { useNavigate } from "react-router-dom";

import { Grid, Heading, Show, Stack, Text } from "@chakra-ui/react";

import { useAppDispatch } from "@app/store.ts";

import { useAuth } from "@legacy/features/auth/slice.ts";
import { useIntParam } from "@legacy/shared/hooks/useIntParam.ts";

import { PageHeading } from "@legacy/features/App/comps/PageHeading.tsx";
import { Button } from "@legacy/shared/comps/Button.tsx";

import { PollOpenedIcon } from "@legacy/shared/icons/poll/PollOpenedIcon.tsx";
import { PollSubmittedIcon } from "@legacy/shared/icons/poll/PollSubmittedIcon.tsx";

import { useFetchPoll } from "../../api.ts";
import { useFetchUserAnswers } from "../api.ts";
import { submitPoll, useSliceSelector } from "../slice.ts";

import { slice } from "../slice.ts";

import { useFormStatus } from "react-dom";
import { mutate } from "swr";
import { QuestionView } from "./QuestionView.tsx";
import { Poll } from "../../types.ts";
import { useFetchUser } from "@legacy/features/user/services.ts";
import { fullNameLong } from "@legacy/shared/utils/index.ts";

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
  const replacePoll = useSliceSelector(
    (state) => "poll" in state && state.poll.id !== pollId,
  );
  const auth = useAuth();
  const { user } = useFetchUser(O.some(auth.userId));

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
      if (!answers.submittedAt && userId === auth.userId && !embed) {
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
  }, [
    dispatch,
    navigate,
    mode,
    poll,
    answers,
    action,
    userId,
    embed,
    auth.userId,
  ]);

  if (!poll || !answers || !mode || !user) return;

  if (mode !== "submitted" && replacePoll) return;

  if (error) {
    console.error(error);
    return;
  }

  if (errorAnswers) {
    console.error(error);
    return;
  }

  if (mode === "opened") {
    const initial = {
      email: user.email,
      phone: user.phoneNumber,
      organization: O.getOrNull(user.organization)?.name ?? "",
      fullname: fullNameLong(user),
      position: user.position,
    };

    return (
      <PollPreview
        kind={poll.kind}
        title={poll.name}
        desc={poll.description}
        icon={<PollOpenedIcon />}
        btnText={poll.kind === "plain" ? "Начать опрос" : "Заполнить форму"}
        onClick={() => dispatch(slice.actions.taken(initial))}
      />
    );
  }

  if (mode === "submitted") {
    return (
      <PollPreviewSubmitted
        kind={poll.kind}
        title={
          poll.kind === "plain" ? "Вы завершили опрос!" : "Вы заполнили форму"
        }
        desc={
          poll.kind === "plain"
            ? "Благодарим за выделенное время и обратную связь."
            : "Благодарим за выделенное время"
        }
        pollId={poll.id}
      />
    );
  }

  return (
    <form
      action={async () => {
        await dispatch(submitPoll());
        await mutate(`/polls/${poll.id}/answers/${userId}/`);
      }}
    >
      {embed ? undefined : action === "view" ? (
        <PageHeading
          title={poll.kind === "plain" ? "Просмотр опроса" : "Просмотр формы"}
        />
      ) : (
        action === "take" && (
          <PageHeading
            title={
              poll.kind === "plain" ? "Прохождение опроса" : "Заполнение формы"
            }
          >
            <SubmitButton poll={poll} />
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

const SubmitButton = ({ poll }: { poll: Poll }) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="solid" disabled={pending}>
      {poll.kind === "plain" ? "Завершить опрос" : "Отправить форму"}
    </Button>
  );
};

const PollPreview = ({
  kind,
  title,
  desc,
  btnText,
  disabled,
  onClick,
  icon,
}: {
  kind: Poll["kind"];
  title: string;
  desc: string;
  btnText: string;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
}) => {
  return (
    <>
      <PageHeading
        title={kind === "plain" ? "Прохождение опроса" : "Заполнение формы"}
      />
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

const PollPreviewSubmitted = ({
  kind,
  title,
  desc,
  pollId,
}: {
  kind: Poll["kind"];
  title: string;
  desc: string;
  pollId: number;
}) => {
  const navigate = useNavigate();
  const { pending } = useFormStatus();

  return (
    <PollPreview
      kind={kind}
      title={title}
      desc={desc}
      icon={<PollSubmittedIcon />}
      btnText="Посмотреть свои ответы"
      disabled={pending}
      onClick={() => navigate(`/polls/view/${pollId}`, { replace: true })}
    />
  );
};
