import { useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { ButtonProps, Flex, Show, Stack } from "@chakra-ui/react";

import { useAuth } from "@/features/auth/slice.ts";

import { Page } from "@/features/App/comps/Page.tsx";
import { PageHeading } from "@/features/App/comps/PageHeading.tsx";
import { Button } from "@/shared/comps/Button.tsx";

import { useFetchPolls } from "../api.ts";
import { useTab } from "./slice.ts";

import { GlobalStats } from "./parts/GlobalStats.tsx";
import { PollsTable } from "./parts/PollsTable.tsx";
import { PollsTabs } from "./parts/PollsTabs.tsx";
import { ShadowBox } from "./parts/ShadowBox.tsx";

export default function PollsDashboardPage() {
  const { userId } = useAuth();
  const { data: pollsAll } = useFetchPolls();
  const tab = useTab();

  const polls = useMemo(() => {
    if (!pollsAll) return pollsAll;
    if (tab === "available") {
      return pollsAll.filter((poll) => poll.status !== "draft");
    } else {
      return pollsAll.filter((poll) => poll.author === userId);
    }
  }, [pollsAll, tab, userId]);

  if (!polls) return;

  return (
    <Page>
      <PageHeading title="Опросы" />
      <Stack gap={7}>
        <ShadowBox>
          <Stack bg="gray.9" align="center">
            <GlobalStats polls={polls} px={28} py={5} w="fit" />
            <PollsTabs />
          </Stack>
        </ShadowBox>
        <Flex justify="end">
          <CreateButton />
        </Flex>
        <PollsTable polls={polls} />
      </Stack>
    </Page>
  );
}

const CreateButton = (props: ButtonProps) => {
  const navigate = useNavigate();
  const { groups } = useAuth();

  return (
    <Show when={groups.includes("create-poll")}>
      <Button
        variant="solid"
        onClick={() => navigate("/polls/create")}
        {...props}
      >
        Создать опрос
      </Button>
    </Show>
  );
};
