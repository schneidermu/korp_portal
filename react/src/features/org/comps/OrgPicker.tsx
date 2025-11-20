import React, { useMemo } from "react";

import { createListCollection, Heading, Select, Text } from "@chakra-ui/react";

import { useFetchOrgs } from "@/features/org/services.ts";

export const OrgPicker = React.memo(function OrgPicker({
  orgId,
  setOrgId,
  title,
  concreteOnly,
}: {
  orgId: number | null;
  setOrgId: (orgId: string | null) => void;
  title: string;
  concreteOnly?: boolean;
}) {
  const { data: orgs } = useFetchOrgs();

  const collection = useMemo(() => {
    const items =
      orgs?.map((org) => ({
        value: org.id.toString(),
        label: org.name,
      })) ?? [];
    if (!concreteOnly) {
      items.unshift(
        { value: "0", label: "Без организации" },
        { value: "", label: "Все организации" },
      );
    }
    return createListCollection({ items });
  }, [concreteOnly, orgs]);

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
            {title}{" "}
            {orgId !== null && (
              <>
                (<Select.ValueText display="inline" />)
              </>
            )}
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

export const UnitPicker = React.memo(function UnitPicker({
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
