import { Chart, useChart } from "@chakra-ui/charts";
import {
  Grid,
  GridProps,
  HStack,
  Icon,
  Stack,
  StackProps,
  Text,
} from "@chakra-ui/react";
import { Fragment, ReactNode } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { Poll } from "../../types";
import { ComputerSurveyIcon } from "../icons/ComputerSurvey";
import { ComputerSurvey2Icon } from "../icons/ComputerSurvey2";
import { SurveyIcon } from "../icons/Survey";
import { ShadowBox } from "./ShadowBox";
import { RatingIcon } from "../icons/Rating";
import { normPercents } from "@legacy/shared/utils";

export const GlobalStats = ({
  polls,
  ...rest
}: { polls: Poll[] } & GridProps) => {
  return (
    <Grid
      templateColumns="2fr 2fr 3fr"
      templateRows="1fr 1fr"
      gridAutoFlow="column"
      gapX={3}
      gapY={6}
      {...rest}
    >
      <Stats
        icon={<SurveyIcon />}
        name="Количество созданных опросов"
        stat={polls.length}
      />
      <Stats
        icon={<ComputerSurveyIcon />}
        name="Количество опубликованных опросов"
        stat={polls.filter(({ status }) => status === "published").length}
      />
      <Stats
        icon={<RatingIcon />}
        name="Количество участников опроса"
        stat={polls.reduce((acc, poll) => acc + poll.takenCount, 0)}
      />
      <Stats
        icon={<ComputerSurvey2Icon />}
        name="Количество завершенных опросов"
        stat={polls.filter(({ status }) => status === "completed").length}
      />
      <StatusPieChart polls={polls} gridRow="span 2" />
    </Grid>
  );
};

const Stats = ({
  icon,
  name,
  stat,
  ...rest
}: { icon: ReactNode; name: string; stat: number } & StackProps) => {
  return (
    <ShadowBox>
      <HStack bg="white" px={8} py={3} gap={3} {...rest}>
        <Icon w={16}>{icon}</Icon>
        <Stack gap={2}>
          <Text fontWeight="light" textAlign="center">
            {name}
          </Text>
          <Text fontSize="2xl" color="blue.1" textAlign="center">
            {stat}
          </Text>
        </Stack>
      </HStack>
    </ShadowBox>
  );
};

const StatusPieChart = ({ polls, ...rest }: { polls: Poll[] } & StackProps) => {
  const counts: { [key in Poll["status"] | "total"]: number } = {
    draft: 0,
    published: 0,
    completed: 0,
    total: 0,
  };
  for (const poll of polls) {
    counts[poll.status]++;
    counts.total++;
  }

  const pcts =
    counts.total > 0
      ? normPercents([
          (100 * counts.completed) / counts.total,
          (100 * counts.published) / counts.total,
          (100 * counts.draft) / counts.total,
        ])
      : [0, 0, 0];

  const chart = useChart({
    data: [
      {
        name: "Завершено опросов",
        value: counts.completed,
        color: "#2F80ED",
      },
      {
        name: "Опубликовано опросов",
        value: counts.published,
        color: "#5CCFF0",
      },
      {
        name: "Опросы в черновиках",
        value: counts.draft,
        color: "#5A3499",
      },
    ],
  });

  return (
    <ShadowBox>
      <HStack bg="white" p={10} gap={10} {...rest}>
        <Chart.Root flexGrow="0" boxSize="140px" chart={chart}>
          <PieChart>
            <Pie
              startAngle={90}
              endAngle={-270}
              animationDuration={400}
              data={chart.data}
              dataKey={chart.key("value")}
              outerRadius={70}
              innerRadius={35}
            >
              {chart.data.map((item) => {
                return <Cell key={item.name} fill={chart.color(item.color)} />;
              })}
            </Pie>
          </PieChart>
        </Chart.Root>
        <Grid
          templateColumns="1fr auto"
          gapX={4}
          alignItems="center"
          h="full"
          py={4}
        >
          {chart.data.map((item, i) => (
            <Fragment key={item.name}>
              <Text fontSize="2xl" color={item.color} textWrap="nowrap">
                {item.value} ({pcts[i]}%)
              </Text>
              <Text fontSize="xs" fontWeight="light">
                {item.name}
              </Text>
            </Fragment>
          ))}
        </Grid>
      </HStack>
    </ShadowBox>
  );
};
