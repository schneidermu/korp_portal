import { Box, BoxProps, Flex, Grid, Stack, Text } from "@chakra-ui/react";

import { Option as O } from "effect";

import { useAuth } from "@/features/auth/slice";
import { useFetchUser } from "@/features/user/services";

import { Page } from "@/features/App/comps/Page";
import { Avatar } from "../user/comps/Avatar";
import { Calendar } from "./parts/Calendar";

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
      <Grid templateColumns="22rem auto">
        <Stack gap={4} borderRadius={2} px={4} py={3} bg="#f5f5f5">
          <Profile />
          <Calendar />
        </Stack>
        <Box>world</Box>
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
      >
        {user.lastName} {user.firstName}
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
      {...rest}
    >
      <Box>{value}</Box>
      <Box>{name}</Box>
    </Box>
  );
};
