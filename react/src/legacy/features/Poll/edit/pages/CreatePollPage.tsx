import { useEffect } from "react";

import { Heading } from "@chakra-ui/react";

import { useAppDispatch } from "@app/store";
import { useAuth } from "@legacy/features/auth/slice";

import { Page } from "@legacy/features/App/comps/Page";
import { PageHeading } from "@legacy/features/App/comps/PageHeading";
import { Button } from "@legacy/shared/comps/Button";

import { actions, savePoll, useSliceSelector } from "../slice";

import { PollInfo } from "../parts/PollInfo";
import { QuestionCards } from "../parts/QuestionCards";
import { useNavigate } from "react-router-dom";

export default function CreatePollPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const mode = useSliceSelector((state) => state.mode);

  useEffect(() => {
    dispatch(actions.created({ orgId: auth.orgId ?? undefined }));
  }, [auth.orgId, dispatch]);

  if (!mode) return;

  return (
    <Page>
      <form
        action={async () => {
          const id = (await dispatch(savePoll())).payload;
          navigate(`/polls/edit/${id}`, { replace: true });
        }}
      >
        <PageHeading title="Создание нового опроса">
          <Button type="submit" variant="solid">
            Сохранить черновик
          </Button>
        </PageHeading>
        <PollInfo />
        <Heading as="h3" fontSize="md" mt={9} mb={5}>
          Вопросы
        </Heading>
        <QuestionCards />
        <Button
          variant="ghost"
          w="fit"
          mt={4}
          px={0}
          onClick={() => dispatch(actions.questionAdded())}
        >
          Добавить ещё один вопрос
        </Button>
      </form>
    </Page>
  );
}
