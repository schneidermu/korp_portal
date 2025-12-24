import React, { useEffect, useMemo, useState } from "react";

import { Option as O } from "effect";

import { Grid, Show, Stack, Text } from "@chakra-ui/react";

import {
  useFetchColleagues,
  useFetchUser,
} from "@legacy/features/user/services";
import { User } from "@legacy/features/user/types";

import { Avatar } from "@legacy/features/user/comps/Avatar";
import { Button } from "@legacy/shared/comps/Button";

import { Subsection, SubsectionProps } from "../parts/Subsection";

const UserGrid = React.memo(function UserGrid({ users }: { users: User[] }) {
  return (
    <Grid
      gapX={10}
      gapY={8}
      gridTemplateColumns="repeat(auto-fill, 10rem)"
      justifyContent="start"
    >
      {users.map((user) => (
        <Stack key={user.id} gridAutoColumns="1fr" gap="9" alignItems="center">
          <Avatar w={32} h={32} user={user} />
          <Text textWrap="nowrap">
            {user.firstName} {user.lastName}
          </Text>
        </Stack>
      ))}
    </Grid>
  );
});

export interface TeamSubsectionProps extends SubsectionProps {
  user: User;
}

export const TeamSubsection = React.memo(function TeamSubsection({
  user,
  ...rest
}: TeamSubsectionProps) {
  const [showBoss, setShowBoss] = useState(false);

  const colleagues = useFetchColleagues(user);
  const { user: boss } = useFetchUser(user.bossId);

  useEffect(() => {
    if (O.isNone(user.bossId)) {
      setShowBoss(false);
    }
  }, [user.bossId]);

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
    <Subsection {...rest}>
      <Stack gap="20">
        <Grid gap="10" templateColumns="1fr 1fr" w="fit">
          <Button
            variant={showBoss ? "outline" : "solid"}
            onClick={() => setShowBoss(false)}
          >
            Коллеги
          </Button>
          <Show when={O.isSome(user.bossId)}>
            <Button
              variant={showBoss ? "solid" : "outline"}
              onClick={() => setShowBoss(true)}
            >
              Руководитель
            </Button>
          </Show>
        </Grid>
        <UserGrid users={users} />
      </Stack>
    </Subsection>
  );
});
