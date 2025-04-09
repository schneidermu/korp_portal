import React, { useEffect, useMemo, useState } from "react";

import { Option as O } from "effect";

import { Grid, Show, Stack, Text } from "@chakra-ui/react";

import { useFetchColleagues, useFetchUser } from "@/features/user/services";
import { User } from "@/features/user/types";

import { Avatar } from "@/features/user/comps/Avatar";

import { Button } from "../parts/Button";
import { Subsection, SubsectionProps } from "../parts/Subsection";

import fallbackAvatarAlt from "@/assets/avatar-fallback-alt.png";

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

export interface TeamSubsectionProps extends SubsectionProps {
  user: User;
}

export const TeamSubsection = React.memo(
  React.forwardRef<HTMLDivElement, TeamSubsectionProps>(
    function TeamSubsection(props, ref) {
      const { user, ...rest } = props;

      const [showBoss, setShowBosses] = useState(false);

      const colleagues = useFetchColleagues(user);
      const { user: boss } = useFetchUser(user.bossId);

      useEffect(() => {
        if (O.isNone(user.bossId)) {
          setShowBosses(false);
        }
      }, [user.bossId]);

      const users = useMemo(() => {
        let users: User[] = [];
        if (showBoss && boss) {
          users = [boss];
        } else if (!showBoss) {
          users = [...(colleagues?.values() || [])].filter(
            (colleague) =>
              colleague.id !== user.id &&
              !O.contains(user.bossId, colleague.id),
          );
        }
        return users;
      }, [boss, colleagues, showBoss, user.id, user.bossId]);

      return (
        <Subsection ref={ref} {...rest}>
          <Stack gap="20">
            <Grid gap="10" templateColumns="1fr 1fr" w="fit">
              <Button
                variant={showBoss ? "outline" : "solid"}
                onClick={() => setShowBosses(false)}
              >
                Мои коллеги
              </Button>
              <Show when={O.isSome(user.bossId)}>
                <Button
                  variant={showBoss ? "solid" : "outline"}
                  onClick={() => setShowBosses(true)}
                >
                  Мой руководитель
                </Button>
              </Show>
            </Grid>
            <UserGrid users={users} />
          </Stack>
        </Subsection>
      );
    },
  ),
);
