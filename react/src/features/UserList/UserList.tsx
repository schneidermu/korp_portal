import React, { useEffect, useMemo, useState } from "react";

import {
  Checkbox,
  createListCollection,
  Flex,
  Heading,
  Select,
  Separator,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";

import { QUERY_DEBOUNCE_DELAY, USERS_PAGE_LIMIT } from "@/app/const";

import { useFetchOrgs } from "@/features/org/services";
import { cmpUsers, useFetchUsers } from "@/features/user/services";
import { filterUsers, User } from "@/features/user/types";
import { useIntSearchParam } from "@/shared/hooks/useSearchParam";

import { Page } from "@/features/App/comps/Page";
import { ProfileCard } from "@/features/Profile/comps/ProfileCard";
import { Skills } from "@/features/Skills/Skills";

import { useReachBottom } from "@/shared/hooks/useReachBottom";
import { SearchBar } from "@/shared/comps/SearchBar";
import { ruOnNum } from "@/shared/utils/lang.ts";
import { useIntParam } from "@/shared/hooks/useIntParam.ts";
import { useNavigate } from "react-router-dom";

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

  const collection = useMemo(() => {
    const items =
      orgs?.map((org) => ({
        value: org.id.toString(),
        label: org.name,
      })) ?? [];
    items.unshift(
      { value: "0", label: "Без организации" },
      { value: "", label: "Все организации" },
    );
    return createListCollection({ items });
  }, [orgs]);

  return (
    <Select.Root
      position="relative"
      collection={collection}
      value={orgId === null ? [""] : [orgId.toString()]}
      onValueChange={({ value }) => setOrgId(value[0] || null)}
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger borderWidth={0}>
          <Heading as="h1" w="full" color="blue.4" fontSize="3xl">
            <Select.ValueText placeholder="Выберите организацию" />
          </Heading>
        </Select.Trigger>
      </Select.Control>
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
      <Select.Control>
        <Select.Trigger borderWidth={0}>
          <Heading as="h2" w="full" color="blue.4" fontSize="2xl">
            <Select.ValueText />
          </Heading>
        </Select.Trigger>
      </Select.Control>
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

// /list/ -> orgId=null, users with an org
// /list/0 -> orgId=0, users with no org
// /list/{id} -> orgId={id}, users with org {id}

export const UserList = () => {
  const navigate = useNavigate();
  const orgId = useIntParam("orgId");
  const [unitId, setUnitId] = useIntSearchParam("unitId");
  const [query, setQuery] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [requireEverySkill, setRequireEverySkill] = useState(false);
  const {
    data: { isLoading, users, totalUsers },
  } = useFetchUsers({ orgId, unitId, sort: true, query });
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
    if (!users) {
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
  }, [users, query, skills, requireEverySkill]);

  const l =
    query === "" && skills.length === 0 ? totalUsers : filteredUsers.length;
  const countText = ruOnNum(l, {
    zero: isLoading
      ? "Идёт поиск..."
      : !orgId && query.length < 3
        ? "Введите хотя бы 3 символа в поиск"
        : "Не нашлось ни одного человека",
    one: `Нашёлся ${l} человек`,
    x234: `Нашлось ${l} человека`,
    other: `Нашлось ${l} человек`,
  });

  return (
    <Page>
      <Stack gap="7">
        <Stack>
          <OrgPicker
            orgId={orgId}
            setOrgId={(orgId) =>
              navigate(orgId === null ? "/list/" : `/list/${orgId}`)
            }
          />
          <Show when={orgId}>
            <UnitPicker orgId={orgId} unitId={unitId} setUnitId={setUnitId} />
          </Show>
          <Separator
            borderColor="gray.4"
            borderWidth="var(--separator-thickness)"
          />
        </Stack>
        <SearchBar debounceDelay={QUERY_DEBOUNCE_DELAY} onDebounce={setQuery} />
        <Flex justify="space-between" align="start" gap="8">
          <Show
            when={
              orgId !== 0 &&
              (orgId !== null || (query.length >= 3 && users.size > 0))
            }
          >
            <Skills
              editing
              flexGrow="1"
              placeholder="Поиск навыка"
              skills={skills}
              setSkills={setSkills}
            />
          </Show>
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
          <ProfileCard key={user.id} user={user} highlightSkills={skills} />
        ))}
      </Stack>
    </Page>
  );
};
