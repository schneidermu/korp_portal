import React, { useEffect, useMemo, useState } from "react";

import {
  Checkbox,
  Flex,
  Heading,
  Select,
  Separator,
  Show,
  Stack,
  Text,
  createListCollection,
} from "@chakra-ui/react";

import { QUERY_DEBOUNCE_DELAY, USERS_PAGE_LIMIT } from "@/app/const";

import { useFetchOrgs } from "@/features/org/services";
import { cmpUsers, useFetchUsers } from "@/features/user/services";
import { User, filterUsers } from "@/features/user/types";
import { useIntSearchParam } from "@/shared/hooks/useSearchParam";

import { NewPage } from "@/features/App/comps/NewPage";
import { ProfileCard } from "@/features/NewProfile/comps/ProfileCard";
import { Skills } from "@/features/Skills/Skills";

import { useReachBottom } from "@/shared/hooks/useReachBottom";
import { SearchBar } from "../../shared/comps/SearchBarNew";

const FILTER_FIELDS = new Set<keyof User>([
  "unit",
  "organization",
  "dateOfBirth",
  "position",
  "email",
  "phoneNumber",
  "serviceRank",
  "office",
]);

const OrgPicker = React.memo(function OrgPicker({
  orgId,
  setOrgId,
}: {
  orgId: number | null;
  setOrgId: (orgId: string | null) => void;
}) {
  const { data: orgs } = useFetchOrgs();

  const collection = useMemo(
    () =>
      createListCollection({
        items:
          orgs?.map((org) => ({
            value: org.id.toString(),
            label: org.name,
          })) ?? [],
      }),
    [orgs],
  );

  return (
    <Select.Root
      position="relative"
      collection={collection}
      value={orgId === null ? undefined : [orgId.toString()]}
      onValueChange={({ value }) => setOrgId(value[0])}
    >
      <Select.HiddenSelect />
      <Heading as="h1" color="blue.4" fontSize="3xl">
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Выберите организацию" />
          </Select.Trigger>
        </Select.Control>
      </Heading>
      <Select.Positioner w="full">
        <Select.Content>
          {collection.items.map((item) => (
            <Select.Item key={item.value} item={item} fontSize="smaller">
              <Text color="blue.4" fontSize="2xl">
                {item.label}
              </Text>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
});

const UnitPicker = React.memo(function UnitPicker({
  orgId,
  unitId,
  setUnitId,
}: {
  orgId: number | null;
  unitId: number | null;
  setUnitId: (unitId: string | null) => void;
}) {
  const { data: orgs } = useFetchOrgs();

  const collection = useMemo(() => {
    const items =
      orgs
        ?.find((org) => org.id === orgId)
        ?.units.map((unit) => ({
          value: unit.id.toString(),
          label: unit.name,
        })) ?? [];
    items.unshift({ value: "", label: "Все подразделения" });
    return createListCollection({ items });
  }, [orgs, orgId]);

  return (
    <Select.Root
      position="relative"
      collection={collection}
      value={[unitId?.toString() ?? ""]}
      onValueChange={({ value }) => setUnitId(value[0] || null)}
    >
      <Select.HiddenSelect />
      <Heading as="h2" color="blue.4" fontSize="2xl">
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
        </Select.Control>
      </Heading>
      <Select.Positioner w="full">
        <Select.Content>
          {collection.items.map((item) => (
            <Select.Item key={item.value} item={item} fontSize="smaller">
              <Text color="blue.4" fontSize="xl">
                {item.label}
              </Text>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
});

export const NewUserList = () => {
  const [orgId, setOrgId] = useIntSearchParam("orgId");
  const [unitId, setUnitId] = useIntSearchParam("unitId");
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [requireEverySkill, setRequireEverySkill] = useState(false);
  const { data: users } = useFetchUsers({ orgId, unitId, sort: true });
  const [numPages, setNumPages] = useState(1);

  useReachBottom(() => {
    if (users.size > numPages * USERS_PAGE_LIMIT) {
      setNumPages(numPages + 1);
      return true;
    }
    return false;
  });

  useEffect(() => setNumPages(1), [orgId, unitId, query, setNumPages]);

  const filteredUsers = useMemo(() => {
    if (!users || orgId === null) {
      return [];
    }

    let filteredUsers = filterUsers([...users.values()], query, FILTER_FIELDS);
    if (skills.length > 0) {
      filteredUsers = filteredUsers.filter((user) => {
        const userSkills = user.skills.map((skill) => skill.toLowerCase());
        const matchSkills = skills.map((s) => s.toLowerCase());
        if (requireEverySkill) {
          return matchSkills.every((matchSkill) =>
            userSkills.some((userSkill) => userSkill.includes(matchSkill)),
          );
        } else {
          return matchSkills.some((matchSkill) =>
            userSkills.some((userSkill) => userSkill.includes(matchSkill)),
          );
        }
      });
    }
    filteredUsers.sort(cmpUsers);

    return filteredUsers;
  }, [users, query, skills, requireEverySkill, orgId]);

  const l = filteredUsers.length;
  const countText =
    `Найдено всего: ${l} человек` +
    ([2, 3, 4].includes(l % 10) && ![12, 13, 14].includes(l % 100) ? "а" : "");

  return (
    <NewPage>
      <Stack gap="7">
        <Stack>
          <OrgPicker orgId={orgId} setOrgId={setOrgId} />
          <UnitPicker orgId={orgId} unitId={unitId} setUnitId={setUnitId} />
          <Separator
            borderColor="gray.4"
            borderWidth="var(--separator-thickness)"
          />
        </Stack>
        <SearchBar debounceDelay={QUERY_DEBOUNCE_DELAY} onDebounce={setQuery} />
        <Flex justify="space-between" align="start" gap="8">
          <Skills
            editing
            flexGrow="1"
            placeholder="Поиск навыка"
            skills={skills}
            setSkills={setSkills}
          />
          <Show when={skills.length >= 2}>
            <Checkbox.Root
              flexShrink="0"
              variant="outline"
              checked={requireEverySkill}
              onCheckedChange={({ checked }) => setRequireEverySkill(!!checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control borderWidth={1} borderColor="gray.2">
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>Нужен каждый навык</Checkbox.Label>
            </Checkbox.Root>
          </Show>
        </Flex>
        <Text>{countText}</Text>
        {filteredUsers.slice(0, numPages * USERS_PAGE_LIMIT).map((user) => (
          <ProfileCard key={user.id} user={user} hightlightSkills={skills} />
        ))}
      </Stack>
    </NewPage>
  );
};
