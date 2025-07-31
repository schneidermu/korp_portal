import {
  Box,
  BoxProps,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Stack,
  StackProps,
  Text,
} from "@chakra-ui/react";

import { Option as O } from "effect";

import { useAuth } from "@/features/auth/slice";
import { useFetchUser } from "@/features/user/services";

import { Page } from "@/features/App/comps/Page";
import { useFeed } from "@/features/feed/services.ts";
import { Link } from "react-router-dom";
import { CalendarWidget } from "../Calendar/views/CalendarWidget";
import { Avatar } from "../user/comps/Avatar";

import { News } from "@/features/feed/types.ts";

import newsIcon1 from "@/assets/home/news-icon-1.png";
import newsIcon2 from "@/assets/home/news-icon-2.png";
import newsIcon3 from "@/assets/home/news-icon-3.png";
import { useFetchPolls } from "@/features/Poll/api";
import { Poll } from "@/features/Poll/types";
import { formatDateLong, formatDateNumeric } from "@/shared/utils";
import { ruOnNum } from "@/shared/utils/lang";
import { LuMoveRight } from "react-icons/lu";
import { BirthdaysWidget } from "../Calendar/views/BirthdaysWidget";
import { NewsCardSep } from "./parts/NewsCardSep";
import { SegmentsSection } from "./parts/Segments";

const NEWS_ICONS = [newsIcon1, newsIcon2, newsIcon3];
const NEWS_ICONS_HEIGHTS = ["56px", "42px", "37px"];

const SHADOW = "0 4px 4px 0 rgba(0, 0, 0, 25%)";

export default function HomePage() {
  return (
    <Page>
      <Grid templateColumns="22rem auto" gapX={5}>
        <Stack gap={4} borderRadius={2} px={4} py={3} bg="gray.12" h="fit">
          <Profile />
          <CalendarWidget />
          <BirthdaysWidget />
        </Stack>
        <Stack gap={16} pt={3}>
          <NewsSection />
          <SegmentsSection />
          <PollsSection />
        </Stack>
      </Grid>
    </Page>
  );
}

const Profile = () => {
  const auth = useAuth();
  const { user } = useFetchUser(O.some(auth.userId));

  if (!user) return;

  return (
    <Stack gap={5} borderRadius={2} bg="blue.2" px={3} py={5} shadow={SHADOW}>
      <Box
        bg="blue.8"
        color="white"
        w="fit"
        px={3}
        py="2px"
        fontSize="xs"
        borderRadius="3px"
        cursor="default"
      >
        {user?.status}
      </Box>
      <Flex justify="center">
        <Avatar w={24} h={24} user={user} />
      </Flex>
      <Text
        color="white"
        fontSize="xl"
        fontWeight="semibold"
        textAlign="center"
        _hover={{ color: "white", textDecoration: "underline" }}
        asChild
      >
        <Link to={`/profile/${user.id}`}>
          {user.lastName} {user.firstName}
        </Link>
      </Text>
      <Grid gap={4} px={4} templateColumns="1fr 1fr 1fr">
        <StatsBox
          name="Рейтинг"
          value={O.map(user.avgRating, (r) =>
            (Math.round(10 * r) / 10).toString(),
          ).pipe(O.getOrElse(() => "?"))}
        />
        <PollsStats />
        {/* TODO: show actual numbers, use ruToNum */}
        <StatsBox name="Курсов" value="0" />
      </Grid>
    </Stack>
  );
};

const StatsBox = ({
  name,
  value,
  ...rest
}: { name: string; value: string } & Omit<BoxProps, "children">) => {
  return (
    <Box
      shadow={SHADOW}
      bg="rgba(255, 255, 255, 34%)"
      color="white"
      px={2}
      py={4}
      textAlign="center"
      borderRadius="3px"
      cursor="default"
      {...rest}
    >
      <Box>{value}</Box>
      <Box>{name}</Box>
    </Box>
  );
};

const PollsStats = () => {
  const { orgId } = useAuth();

  const { data: polls } = useFetchPolls({
    status: "published",
    orgId: orgId ?? undefined,
  });

  const n = polls?.length ?? 0;

  return (
    <StatsBox
      name={ruOnNum(n, {
        other: "Опросов",
        one: "Опрос",
        x234: "Опроса",
      })}
      value={n.toString()}
    />
  );
};

const NewsSection = () => {
  const { orgId } = useAuth();
  const { data: news } = useFeed({ showPolls: false, orgId });

  return (
    <Stack as="section" gap={5}>
      <Heading as="h1" fontWeight="normal" fontSize="3xl">
        Наша жизнь
      </Heading>
      <Grid templateColumns="1fr 1fr 1fr" gapX={3}>
        {news
          .slice(0, 3)
          .map(
            (post, i) =>
              post.kind === "news" && (
                <NewsCard key={post.id} news={post} index={i} />
              ),
          )}
      </Grid>
    </Stack>
  );
};

const NewsCard = ({
  news,
  index,
  ...rest
}: { news: News; index: number } & StackProps) => {
  return (
    <Stack
      as="article"
      gap={5}
      align="center"
      bg={index === 2 ? "blue.10" : "gray.12"}
      pl={5}
      pr={4}
      pt={3}
      pb={8}
      borderRadius={2}
      {...rest}
    >
      <Box w="full">
        <Flex h="70px" justify="space-between">
          <Text
            color={index === 2 ? "white" : "blue.1"}
            fontSize="xl"
            fontWeight="light"
          >
            {formatDateNumeric(news.publishedAt)}
          </Text>
          <Image h={NEWS_ICONS_HEIGHTS[index]} src={NEWS_ICONS[index]} />
        </Flex>
        <Heading
          as="h1"
          fontWeight="semibold"
          h="2.4em"
          fontSize="2xl"
          color={index === 2 ? "white" : "black"}
          display="-webkit-box"
          WebkitLineClamp={2}
          lineClamp={2}
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {news.title}
        </Heading>
      </Box>
      <NewsCardSep stroke={index === 2 ? "white" : "#2F80ED"} />
      <Flex px={4} justify="center" w="full">
        <Box
          fontSize="xl"
          py={1}
          textAlign="center"
          borderRadius={2}
          bg={index === 2 ? "white" : "blue.10"}
          color={index === 2 ? "blue.1" : "white"}
          w="full"
          asChild
          _hover={{
            color: index === 2 ? "blue.1" : "white",
            textDecoration: "underline",
          }}
        >
          <Link to="/feed">Перейти</Link>
        </Box>
      </Flex>
    </Stack>
  );
};

const PollsSection = () => {
  const { orgId } = useAuth();
  const { data: polls } = useFetchPolls({
    status: "published",
    orgId: orgId ?? undefined,
  });

  return (
    <Stack as="section" gap={5}>
      <Heading as="h1" fontWeight="normal" fontSize="3xl">
        Опросы
      </Heading>
      <Stack gap={7}>
        {(polls ?? []).slice(0, 3).map((post) => (
          <PollCard key={post.id} poll={post} />
        ))}
      </Stack>
    </Stack>
  );
};

const PollCard = ({ poll, ...rest }: { poll: Poll } & StackProps) => {
  return (
    <Grid
      as="article"
      gap={5}
      alignItems="center"
      bg={{ base: "gray.12", _hover: "blue.2" }}
      color={{ base: "black", _hover: "white" }}
      transition="0.3s"
      pl={9}
      pr={10}
      pt={5}
      pb={6}
      borderRadius={2}
      templateColumns="5fr 3fr 1fr"
      _hover={{ "& div:first-of-type": { bg: "rgba(255, 255, 255, 0.2)" } }}
      asChild
      {...rest}
    >
      <Link to={`/polls/view/${poll.id}`}>
        <Heading as="h1" fontSize="2xl" transition="0.3s">
          {poll.name}
        </Heading>
        <Center
          transition="0.3s"
          bg="gray.200"
          py={4}
          borderRadius={1}
          fontSize="xl"
        >
          {poll.publishedAt
            ? formatDateLong(new Date(poll.publishedAt))
            : "\xA0"}
        </Center>
        <Icon w={8} h={8} transition="0.3s" justifySelf="center">
          <LuMoveRight />
        </Icon>
      </Link>
    </Grid>
  );
};
