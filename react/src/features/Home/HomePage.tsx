import {
  Box,
  BoxProps,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Stack,
  StackProps,
  Text,
} from "@chakra-ui/react";

import { Option as O } from "effect";

import { useAuth } from "@/features/auth/slice";
import { useFetchUser } from "@/features/user/services";

import { Page } from "@/features/App/comps/Page";
import { Avatar } from "../user/comps/Avatar";
import { Calendar } from "./parts/Calendar";
import { Link } from "react-router-dom";
import { useFeed } from "@/features/feed/services.ts";

import { News } from "@/features/feed/types.ts";

import newsIcon1 from "@/assets/home/news-icon-1.png";
import newsIcon2 from "@/assets/home/news-icon-2.png";
import newsIcon3 from "@/assets/home/news-icon-3.png";
import { NewsCardSep } from "./icons/NewsCardSep";
import {Poll} from "@/features/Poll/types.ts";

const NEWS_ICONS = [newsIcon1, newsIcon2, newsIcon3];
const NEWS_ICONS_HEIGHTS = ["56px", "42px", "37px"];

const SHADOW = "0 4px 4px 0 rgba(0, 0, 0, 25%)";

export default function HomePage() {
  return (
    <Page>
      {/* <style> */}
      {/*   body { */}
      {/*     color: #f5f5f5; */}
      {/**/}
      {/*   } */}
      {/* </style> */}
      <Grid templateColumns="22rem auto" gapX={5}>
        <Stack gap={4} borderRadius={2} px={4} py={3} bg="#f5f5f5">
          <Profile />
          <Calendar />
        </Stack>
        <Stack gap={16}>
          <NewsSection />
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
        {/* TODO: show actual numbers, use ruToNum */}
        <StatsBox name="Опроса" value="2" />
        <StatsBox name="Курса" value="53" />
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
      // fontSize="xl"
      cursor="default"
      {...rest}
    >
      <Box>{value}</Box>
      <Box>{name}</Box>
    </Box>
  );
};

const NewsSection = () => {
  const { orgId } = useAuth();
  const { data: news } = useFeed({ showPolls: false, orgId });

  return (
    <Stack as="article" gap={5}>
      <Heading fontWeight="normal" fontSize="3xl">
        Наша жизнь
      </Heading>
      <Grid templateColumns="1fr 1fr 1fr" gapX={3}>
        {news
          .slice(0, 3)
          .map(
            (post, i) =>
              post.kind === "news" && <NewsCard key={post.id} news={post} index={i} />,
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
      bg={index === 2 ? "blue.10" : "#f5f5f5"}
      pl={5}
      pr={4}
      pt={3}
      pb={8}
      borderRadius={2}
      {...rest}
    >
      <Box w="full">
        <Flex h="70px" justify="end">
          <Image h={NEWS_ICONS_HEIGHTS[index]} src={NEWS_ICONS[index]} />
        </Flex>
        <Heading
          fontWeight="semibold"
          fontSize="2xl"
          color={index === 2 ? "white" : "black"}
          h="2.2em"
        >
          {news.title}
        </Heading>
      </Box>
      <NewsCardSep stroke={index === 2 ? "white" : "#2F80ED"} />
      <Flex px={4} justify="center" w="full">
        <Button
          fontSize="2xl"
          borderRadius={2}
          bg={index === 2 ? "white" : "blue.10"}
          color={index === 2 ? "blue.1" : "white"}
          w="full"
        >
          Перейти
        </Button>
      </Flex>
    </Stack>
  );
};

const PollsSection = () => {
  const { orgId } = useAuth();
  const { data: polls } = useFeed({ showNews: false, orgId });

  console.log(polls);

  return (
    <Stack as="article" gap={5}>
      <Heading fontWeight="normal" fontSize="3xl">
        Опросы
      </Heading>
      <Grid templateColumns="1fr 1fr 1fr" gapX={3}>
        {polls
          .slice(0, 3)
          .map(
            (post, i) =>
              post.kind === "polls" && <PollsCard key={post.id} poll={post} index={i} />,
          )}
      </Grid>
    </Stack>
  );
};

const PollsCard = ({
  poll,
  index,
  ...rest
}: { poll: Poll; index: number } & StackProps) => {
  return (
    <Stack
      as="article"
      gap={5}
      align="center"
      bg={index === 2 ? "blue.10" : "#f5f5f5"}
      pl={5}
      pr={4}
      pt={3}
      pb={8}
      borderRadius={2}
      {...rest}
    >
      <Box w="full">
        <Flex h="70px" justify="end">
          <Image h={NEWS_ICONS_HEIGHTS[index]} src={NEWS_ICONS[index]} />
        </Flex>
        <Heading
          fontWeight="semibold"
          fontSize="2xl"
          color={index === 2 ? "white" : "black"}
          h="2.2em"
        >
          {poll.name}
        </Heading>
      </Box>
      <NewsCardSep stroke={index === 2 ? "white" : "#2F80ED"} />
      <Flex px={4} justify="center" w="full">
        <Button
          fontSize="2xl"
          borderRadius={2}
          bg={index === 2 ? "white" : "blue.10"}
          color={index === 2 ? "blue.1" : "white"}
          w="full"
        >
          Перейти
        </Button>
      </Flex>
    </Stack>
  );
};
