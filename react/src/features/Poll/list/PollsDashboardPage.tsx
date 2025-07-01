import { useMemo } from "react";

import { useNavigate } from "react-router-dom";

import { Flex, Stack } from "@chakra-ui/react";

import { useAuth } from "@/features/auth/slice.ts";

import { Page } from "@/features/App/comps/Page.tsx";
import { PageHeading } from "@/features/App/comps/PageHeading.tsx";
import { Button } from "@/shared/comps/Button.tsx";

import { useFetchPolls } from "./api.ts";
import { useSliceSelector } from "./slice.ts";

import { GlobalStats } from "./parts/GlobalStats.tsx";
import { PollsTable } from "./parts/PollsTable.tsx";
import { PollsTabs } from "./parts/PollsTabs.tsx";
import { ShadowBox } from "./parts/ShadowBox.tsx";

export default function PollsDashboardPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { data: pollsAll } = useFetchPolls();
  const tab = useSliceSelector(({ tab }) => tab);

  const polls = useMemo(() => {
    if (!pollsAll) return pollsAll;
    if (tab === "available") return pollsAll;
    return pollsAll.filter((poll) => poll.author === userId);
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
          <Button variant="solid" onClick={() => navigate("/polls/create")}>
            Создать опрос
          </Button>
        </Flex>
        <PollsTable polls={polls} />
      </Stack>
    </Page>
  );
}
