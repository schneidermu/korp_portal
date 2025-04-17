import React, { Fragment } from "react";

import { Option as O } from "effect";

import {
  Box,
  BoxProps,
  Grid,
  Heading,
  HStack,
  List,
  Separator,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { NewPage } from "@/features/App/comps/NewPage";
import { useAuth } from "@/features/auth/slice";
import { Avatar } from "@/features/user/comps/Avatar";
import { sortUsers, useFetchUsers } from "@/features/user/services";
import { Unit, User } from "@/features/user/types";
import { useIntSearchParam } from "@/shared/hooks/useSearchParam";
import { fullNameLong } from "@/shared/utils";

/**
 * Group users by their units, flattening the unit hierarchy tree.
 * Ensure that sibling units and users within each unit are ordered by name.
 */
const groupUsersByUnits = (users: User[]) => {
  const parent2children = new Map<
    number | null,
    Map<number, { unit: Unit; users: User[] }>
  >();

  for (const user of users) {
    const { unit: unitOpt } = user;
    if (O.isNone(unitOpt)) {
      continue;
    }
    const unit = unitOpt.value;
    const children = parent2children.get(unit.parentId) || new Map();
    parent2children.set(unit.parentId, children);
    const child = children.get(unit.id);
    if (!child) {
      children.set(unit.id, { unit, users: [user] });
    } else {
      child.users.push(user);
    }
  }
  for (const [, children] of parent2children) {
    for (const child of children.values()) {
      child.users = sortUsers(child.users);
    }
  }

  const units: { unit: Unit; org: User["organization"]; users: User[] }[] = [];

  const pushChildrenOf = (parentId: number | null) => {
    const children = parent2children.get(parentId);
    if (!children) {
      return;
    }
    const flatChildren = [...children.values()];
    flatChildren.sort(({ unit: u1 }, { unit: u2 }) => {
      if (u1.name < u2.name) return -1;
      if (u1.name > u2.name) return +1;
      return 0;
    });
    for (const { unit, users } of flatChildren) {
      units.push({ unit, org: users[0].organization, users });
      pushChildrenOf(unit.id);
    }
  };

  pushChildrenOf(null);

  return units;
};

const Card = React.forwardRef<HTMLDivElement, BoxProps>(
  function Card(props, ref) {
    return (
      <Box
        borderWidth={1}
        borderColor="gray.3"
        borderRadius="2"
        p="8"
        ref={ref}
        {...props}
      ></Box>
    );
  },
);

const BossCard = ({ boss }: { boss: User }) => {
  return (
    <HStack alignItems="start" gap="5">
      <Avatar user={boss} fallbackSrc=""></Avatar>
      <Stack mt="3">
        <Link to={`/new/profile/${boss.id}`}>
          <Heading as="h2" textDecor="underline" fontWeight="semibold">
            {fullNameLong(boss)}
          </Heading>
        </Link>
        <Text>{boss.position}</Text>
        <Show when={O.isSome(boss.bossId)}>
          <Text mt="2" fontWeight="light">
            {O.getOrNull(boss.unit)?.name}
          </Text>
        </Show>
      </Stack>
    </HStack>
  );
};

const UnitsCard = ({ things }: { things: string[] }) => {
  return (
    <List.Root listStyle="revert" color="blue.2">
      {things.map((thing) => (
        <List.Item key={thing} _marker={{ color: "inherit" }} my="3">
          {thing}
        </List.Item>
      ))}
    </List.Root>
  );
};

export const OrgPage = () => {
  const auth = useAuth();
  const [orgId] = useIntSearchParam("id");
  const { data: users } = useFetchUsers({ orgId: orgId ?? auth.orgId });

  const units = groupUsersByUnits([...(users?.values() ?? [])]);

  return (
    <NewPage>
      <Stack>
        <Heading color="blue.4" fontSize="3xl">
          Руководство и структура
        </Heading>
        <Separator
          borderColor="gray.4"
          borderWidth="var(--separator-thickness)"
        />
        <Grid templateColumns="1fr 1.875rem 1fr" gapY="7">
          {units.map(({ users }) => (
            <Fragment key={users[0].id}>
              <Card position="relative">
                <BossCard boss={users[0]} />
              </Card>
              <Stack justifyContent="center">
                <Separator
                  borderColor="gray.4"
                  borderWidth="var(--separator-thickness)"
                />
              </Stack>
              <Card>
                <UnitsCard
                  things={users.map(
                    (user) =>
                      user.lastName +
                      " " +
                      user.firstName +
                      " " +
                      user.position +
                      " " +
                      (O.getOrNull(user.unit)?.name ?? ""),
                  )}
                />
              </Card>
            </Fragment>
          ))}
        </Grid>
      </Stack>
    </NewPage>
  );
};
