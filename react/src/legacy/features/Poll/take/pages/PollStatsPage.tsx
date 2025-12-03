import { Option as O } from "effect";

import { Page } from "@legacy/features/App/comps/Page";
import { PageHeading } from "@legacy/features/App/comps/PageHeading";
import { useFetchPoll, useFetchStats } from "@legacy/features/Poll/api";
import { Poll, PollStats } from "@legacy/features/Poll/types";
import { Tabs } from "@legacy/shared/comps/Tabs";
import { useIntParam } from "@legacy/shared/hooks/useIntParam";
import { fullNameLong, normPercents } from "@legacy/shared/utils";
import { Chart, useChart } from "@chakra-ui/charts";
import {
  Box,
  Center,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Show,
  Stack,
  StackProps,
  Text,
} from "@chakra-ui/react";
import { Fragment, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { PollView } from "../parts/PollView";
import { useFetchSubmittedUserIds } from "../api";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useFetchUser } from "@legacy/features/user/services";

const COLORS = ["#332FED", "#2F80ED", "#5A3499", "#8D5AE1", "#5CCFF0"];

export default function PollStatsPage() {
  const pollId = useIntParam("pollId");
  const [tab, setTab] = useState("total");
  const { data: poll, error } = useFetchPoll(pollId);

  if (!poll) return;

  if (error) {
    console.error(error);
    return;
  }

  const tabs = {
    total: "Сводная статистика",
    users: "По пользователям",
  };

  return (
    <Page>
      <PageHeading
        title={
          poll.kind === "plain" ? "Результаты опроса" : "Заполнение заявки"
        }
      />
      <Stack gap={10}>
        <Stack gap={3}>
          <Box>
            <Heading as="h2" fontSize="md" mb="3">
              {poll.name}
            </Heading>
            <Text>{poll.description}</Text>
          </Box>
          <Show when={poll.kind === "plain"}>
            <Center pt={7} bg="gray.9">
              <Tabs
                tabs={tabs}
                lazyMount
                unmountOnExit
                value={tab}
                onValueChange={(e) => setTab(e.value)}
              />
            </Center>
          </Show>
        </Stack>
        {tab === "users" || poll.kind === "form" ? (
          <UsersTab poll={poll} />
        ) : tab === "total" ? (
          <TotalTab poll={poll} />
        ) : undefined}
      </Stack>
    </Page>
  );
}

const TotalTab = ({ poll }: { poll: Poll }) => {
  const { data: stats } = useFetchStats(poll.id);

  if (!stats) return;

  if (stats.submissionsCount === 0) {
    return "Пока нет результатов";
  }

  return (
    <Grid templateColumns="1fr 1fr">
      {stats.questions.map((_, i) => (
        <QuestionStatsView key={i} qindex={i} poll={poll} stats={stats} />
      ))}
    </Grid>
  );
};

const QuestionStatsView = ({
  poll,
  stats,
  qindex,
  ...rest
}: {
  poll: Poll;
  stats: PollStats;
  qindex: number;
} & StackProps) => {
  const choices = [...stats.questions[qindex]];
  choices.sort((s1, s2) => s1.votes - s2.votes);

  const pcts = normPercents(
    choices.map(({ votes }) => (100 * votes) / stats.submissionsCount),
  );

  const chart = useChart({
    data: choices.map((s, i) => ({
      name: s.text,
      value: s.votes,
      color: COLORS[i % COLORS.length],
    })),
  });

  return (
    <Stack
      px={5}
      pt={7}
      pb={10}
      bg="white"
      borderRadius="2"
      shadow="0 4px 30px 10px #EFEFEF"
    >
      <Heading fontSize="larger">
        {qindex + 1}. {poll.questions[qindex].text}
      </Heading>
      <HStack p={10} gap={10} {...rest}>
        <Chart.Root flexGrow="0" boxSize="208px" chart={chart}>
          <PieChart>
            <Pie
              startAngle={90}
              endAngle={-270}
              animationDuration={400}
              data={chart.data}
              dataKey={chart.key("value")}
              outerRadius={104}
              innerRadius={52}
            >
              {chart.data.map((item) => {
                return <Cell key={item.name} fill={chart.color(item.color)} />;
              })}
            </Pie>
          </PieChart>
        </Chart.Root>
        <Grid
          templateColumns="1fr 1fr"
          gapX={4}
          alignItems="center"
          h="full"
          py={4}
        >
          {chart.data.map(({ name, color, value }, i) => (
            <Fragment key={name}>
              <Text fontSize="2xl" color={color}>
                {value} ({pcts[i]}%)
              </Text>
              <Text fontSize="s" fontWeight="light">
                {name}
              </Text>
            </Fragment>
          ))}
        </Grid>
      </HStack>
    </Stack>
  );
};

const UsersTab = ({ poll, ...rest }: { poll: Poll } & StackProps) => {
  const { data: uids } = useFetchSubmittedUserIds(poll.id);
  const [page, setPage] = useState(0);

  if (!uids) return;

  if (uids.length === 0) {
    return "Пока нет результатов";
  }

  const uid = uids[page];

  return (
    <Stack {...rest}>
      <Grid templateColumns="auto 1fr" gapX={12} gapY={3}>
        <Text textAlign="center">Пользователь</Text>
        <Heading as="h2" textAlign="left">
          <UserFullName uid={uid} />
        </Heading>
        <HStack color="gray.10">
          <IconButton
            bg="gray.9"
            color="gray.10"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
          >
            <LuChevronLeft />
          </IconButton>
          <Input
            value={page + 1}
            onChange={(e) => setPage(Number(e.target.value) - 1)}
            w={20}
            min={1}
            max={uids.length}
            type="number"
            borderRadius={2}
            px={3}
            py={1}
          />
          из
          <Input
            disabled
            opacity={1}
            w={14}
            value={uids.length}
            borderRadius={2}
            px={3}
            py={1}
          />
          <IconButton
            bg="gray.9"
            color="gray.10"
            onClick={() => setPage(page + 1)}
            disabled={page === uids.length - 1}
          >
            <LuChevronRight />
          </IconButton>
        </HStack>
      </Grid>
      <PollView embed action="view" userId={uid} />
    </Stack>
  );
};

const UserFullName = ({ uid }: { uid: string }) => {
  const { user } = useFetchUser(O.some(uid));
  if (!user) return;
  return fullNameLong(user);
};
