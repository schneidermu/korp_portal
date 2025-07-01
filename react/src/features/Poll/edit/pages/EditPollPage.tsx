import { useEffect, useState } from "react";

import {
  Center,
  Heading,
  HStack,
  Icon,
  Image,
  Show,
  Stack,
} from "@chakra-ui/react";

import { useAppDispatch } from "@/app/store";

import { Page } from "@/features/App/comps/Page";
import { PageHeading } from "@/features/App/comps/PageHeading";
import { Button } from "@/shared/comps/Button";

import { actions, publishPoll, savePoll, useSliceSelector } from "../slice";

import { useIntParam } from "@/shared/hooks/useIntParam";
import { AnimatePresence } from "motion/react";
import { useFormStatus } from "react-dom";
import { removePoll, useFetchPoll } from "../../api";
import { Poll } from "../../types";
import { PollInfo } from "../parts/PollInfo";
import { QuestionCards } from "../parts/QuestionCards";
import { Dialog } from "@/shared/comps/Dialog.tsx";
import { LuCircleAlert } from "react-icons/lu";

import warningIcon from "../assets/warning.svg";
import { useAuth } from "@/features/auth/slice";
import { useNavigate } from "react-router-dom";

export default function EditPollPage() {
  const pollId = useIntParam("pollId");

  const { token } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: poll, error } = useFetchPoll(pollId);
  const mode = useSliceSelector((state) => state.mode);

  useEffect(() => {
    if (!poll || error) return;
    dispatch(actions.viewed(poll));
  }, [dispatch, poll, error]);

  if (error) {
    console.error(error);
    return;
  }

  if (!mode || !poll || !pollId) return;

  const title = mode === "view" ? "Просмотр опроса" : "Редактирование опроса";

  return (
    <Page>
      <form
        action={async () => {
          if (poll.status === "published") {
            // FIXME: could duplicate the poll if this fails
            removePoll(token, pollId); // async
          }
          const id = (await dispatch(savePoll())).payload;
          if (poll.status === "published") {
            navigate(`/polls/edit/${id}`, { replace: true });
          }
        }}
      >
        <PageHeading title={title}>
          <Controls poll={poll} />
        </PageHeading>
        <PollInfo />
        <Heading as="h3" fontSize="md" mt={9} mb={5}>
          Вопросы
        </Heading>
        <QuestionCards />
        <AddQuestionButton />
      </form>
    </Page>
  );
}

const Controls = ({ poll }: { poll: Poll }) => {
  const dispatch = useAppDispatch();
  const readOnly = useSliceSelector((state) => state.mode === "view");
  const { pending } = useFormStatus();
  const isDirty = useSliceSelector(
    (state) => "isDirty" in state && state.isDirty,
  );

  if (readOnly) {
    return (
      <HStack>
        <Button
          variant="outline"
          onClick={() => dispatch(publishPoll(poll.id))}
          disabled={poll.status !== "draft"}
        >
          {poll.status === "draft" ? "Опубликовать" : "Опубликовано"}
        </Button>
        <EditButton poll={poll} />
      </HStack>
    );
  }

  return (
    <HStack>
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => dispatch(actions.viewed(poll))}
      >
        Отменить
      </Button>
      <Button type="submit" variant="solid" disabled={pending || !isDirty}>
        Сохранить
      </Button>
    </HStack>
  );
};

const EditButton = ({ poll }: { poll: Poll }) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const edit = () => dispatch(actions.edited());

  return (
    <Dialog
      title="Подтверждение действия"
      actionText="Да"
      cancelText="Нет, продолжить опрос"
      onAction={edit}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      body={
        <Stack gap={5}>
          <HStack asChild>
            <Heading as="h3" color="blue.1" fontSize="smaller">
              <Icon>
                <LuCircleAlert />
              </Icon>{" "}
              Данный опрос был опубликован ранее
            </Heading>
          </HStack>
          Если вы откроете режим редактирования, все ранее данные ответы
          пользователей будут удалены и при публикации опрос будет начат заново.
          <Center>
            <Image h={36} w={36} src={warningIcon} />
          </Center>
          Вы действительно хотите открыть режим редактирования?
        </Stack>
      }
    >
      <Button
        variant="solid"
        onClick={() => {
          if (poll.status === "published") {
            setOpen(true);
          } else if (poll.status === "draft") {
            edit();
          }
        }}
      >
        Редактировать
      </Button>
    </Dialog>
  );
};

const AddQuestionButton = () => {
  const dispatch = useAppDispatch();
  const readOnly = useSliceSelector((state) => state.mode === "view");
  const { pending } = useFormStatus();

  return (
    <AnimatePresence>
      <Show when={!readOnly}>
        <Button
          variant="ghost"
          w="fit"
          mt={4}
          px={0}
          disabled={pending}
          onClick={() => dispatch(actions.questionAdded())}
        >
          Добавить ещё один вопрос
        </Button>
      </Show>
    </AnimatePresence>
  );
};
