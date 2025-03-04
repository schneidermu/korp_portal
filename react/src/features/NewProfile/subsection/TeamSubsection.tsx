import React, { useMemo, useState } from "react";

import { Option as O } from "effect";

import { Grid, Stack, Text } from "@chakra-ui/react";

import { useFetchColleagues, useFetchUser } from "@/features/user/services";
import { User } from "@/features/user/types";

import { Avatar } from "../parts/Avatar";
import { Button } from "../parts/Button";

import fallbackAvatarAlt from "@/assets/avatar-fallback-alt.svg";

const UserGrid = React.memo(function UserGrid({ users }: { users: User[] }) {
  return (
    <Grid
      gapX="16"
      gapY="8"
      gridTemplateColumns="repeat(6, 1fr)"
      justifyContent="start"
    >
      {users.map((user) => (
        <Stack key={user.id} gap="9" alignItems="center">
          <Avatar fallbackSrc={fallbackAvatarAlt} user={user} />
          <Text textWrap="nowrap">
            {user.firstName} {user.lastName}
          </Text>
        </Stack>
      ))}
    </Grid>
  );
});

export const TeamSubsection = ({ user }: { user: User }) => {
  const [showBoss, setShowBosses] = useState(false);

  const colleagues = useFetchColleagues(user);
  const { user: boss } = useFetchUser(user.bossId);

  const users = useMemo(() => {
    let users: User[] = [];
    if (showBoss && boss) {
      users = [boss];
    } else if (!showBoss) {
      users = [...(colleagues?.values() || [])].filter(
        (colleague) =>
          colleague.id !== user.id && !O.contains(user.bossId, colleague.id),
      );
    }
    return users;
  }, [boss, colleagues, showBoss, user.id, user.bossId]);

  return (
    <Stack gap="20">
      <Grid gap="10" templateColumns="1fr 1fr" w="fit">
        <Button
          variant={showBoss ? "outline" : "solid"}
          onClick={() => setShowBosses(false)}
        >
          Мои коллеги
        </Button>
        <Button
          variant={showBoss ? "solid" : "outline"}
          onClick={() => setShowBosses(true)}
        >
          Мои руководители
        </Button>
      </Grid>
      <UserGrid users={users} />
    </Stack>
  );
};
