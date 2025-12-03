import { useAppDispatch } from "@app/store";
import { useTokenFetcher } from "@legacy/features/auth/hooks";
import {
  Box,
  createListCollection,
  Field,
  HStack,
  Input,
  Portal,
  Select,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { useMemo } from "react";
import useSWR from "swr";
import { actions, useIsReadOnly, usePollSelector } from "../slice";
import { ShadowBox } from "./ShadowBox";

import { Checkbox } from "@legacy/shared/comps/Checkbox";
import { useFormStatus } from "react-dom";

export const PollInfo = () => {
  return (
    <ShadowBox px={7} py={11} borderRadius={1}>
      <Stack gap={5}>
        <PollNameField />

        <HStack align="end" justify="start" gap={7}>
          <Box flexBasis="40%">
            <GroupSelect />
          </Box>

          <HStack mb={3} gap={4}>
            <PollIsPublicCheckbox />
            <PollIsAnonymousCheckbox />
          </HStack>
        </HStack>

        <PollDescriptionInput />
      </Stack>
    </ShadowBox>
  );
};

interface PollGroup {
  id: number;
  name: string;
  description: string;
}

const GroupSelect = () => {
  const dispatch = useAppDispatch();
  const groupId = usePollSelector((poll) => poll?.groupId);
  const fetcher = useTokenFetcher();
  const readOnly = useIsReadOnly();
  const { pending } = useFormStatus();

  const { data: groups } = useSWR<PollGroup[]>(
    "/poll_groups/",
    (path: string) => fetcher(path).then((res) => res.json()),
  );

  const collection = useMemo(
    () =>
      createListCollection({
        items: (groups ?? []).map(({ id, name }) => ({
          value: id.toString(),
          label: name,
        })),
      }),
    [groups],
  );

  const value = groupId !== undefined ? [groupId.toString()] : undefined;

  return (
    <Select.Root
      collection={collection}
      value={value}
      onValueChange={(e) =>
        dispatch(
          actions.infoUpdated({
            groupId: Number(e.value[0]),
          }),
        )
      }
    >
      <Select.HiddenSelect />
      <Select.Label
        fontSize="sm"
        color="gray.2"
        ml={2}
        _disabled={{ color: "gray.2" }}
      >
        Группа опроса
      </Select.Label>
      <Select.Control>
        <Select.Trigger
          disabled={readOnly || pending}
          borderRadius={2}
          borderColor="gray.1"
          opacity={1}
        >
          <Select.ValueText />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item} fontSize="smaller">
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

const PollNameField = () => {
  const name = usePollSelector((poll) => poll?.name ?? "");
  const dispatch = useAppDispatch();

  return (
    <Field.Root>
      <Field.Label fontSize="sm" color="gray.2" ml={2}>
        Наименование опроса
      </Field.Label>
      <Input
        required
        borderRadius={2}
        borderColor="gray.1"
        value={name}
        onChange={(e) =>
          dispatch(actions.infoUpdated({ name: e.target.value }))
        }
      />
    </Field.Root>
  );
};

const PollIsPublicCheckbox = () => {
  const dispatch = useAppDispatch();
  const isPublic = usePollSelector((poll) => !!poll?.isPublic);

  return (
    <Checkbox
      label="Публичный опрос"
      checked={isPublic}
      onCheckedChange={(e) =>
        dispatch(
          actions.infoUpdated({
            isPublic: !!e.checked,
          }),
        )
      }
    />
  );
};

const PollIsAnonymousCheckbox = () => {
  const dispatch = useAppDispatch();
  const isAnonymous = usePollSelector((poll) => !!poll?.isAnonymous);

  return (
    <Checkbox
      label="Анонимный опрос"
      checked={isAnonymous}
      onCheckedChange={(e) =>
        dispatch(
          actions.infoUpdated({
            isAnonymous: !!e.checked,
          }),
        )
      }
    />
  );
};

const PollDescriptionInput = () => {
  const dispatch = useAppDispatch();
  const description = usePollSelector((poll) => poll?.description ?? "");

  return (
    <Field.Root>
      <Field.Label fontSize="sm" color="gray.2" ml={2}>
        Описание опроса
      </Field.Label>
      <Textarea
        required
        borderRadius={2}
        borderColor="gray.1"
        rows={3}
        resize="none"
        value={description}
        onChange={(e) =>
          dispatch(actions.infoUpdated({ description: e.target.value }))
        }
      />
    </Field.Root>
  );
};
