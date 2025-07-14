import {
  Box,
  Button,
  CloseButton,
  Combobox,
  Dialog,
  Field,
  HStack,
  Icon,
  Input,
  Portal,
  Stack,
  StackProps,
  Text,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { Option as O } from "effect";

import { TreeNode, UnitNode, UserNode } from "@/features/UserTree/types";
import { LuUser } from "@/shared/icons/LuUser";

import { useAppDispatch } from "@/app/store";
import { useFetchUser, useFetchUsers } from "@/features/user/services";
import { User } from "@/features/user/types";
import { fullNameLong } from "@/shared/utils";
import { actions, useSliceSelector } from "../slice";
import { Tree } from "../types";
import { useMemo, useEffect } from "react";

const UserLink = ({
  userId,
  fullname,
  ...rest
}: {
  userId: string;
  fullname: string;
} & StackProps) => {
  return (
    <HStack
      cursor="pointer"
      asChild
      _hover={{ textDecoration: "underline" }}
      {...rest}
    >
      <Link to={`/profile/${userId}`}>
        <Icon>
          <LuUser />
        </Icon>
        <Text color="blue.5">{fullname}</Text>
      </Link>
    </HStack>
  );
};

const UserNodeView = ({ user }: { user: UserNode }) => {
  return (
    <Stack textAlign="center">
      <Text fontSize="xl">{user.position}</Text>
      <UserLink
        justify="center"
        userId={user.id}
        fullname={`${user.lastName} ${user.firstName} ${user.patronym ?? ""}`}
      />
    </Stack>
  );
};

const UnitNodeView = ({ tree, unit }: { tree: Tree; unit: UnitNode }) => {
  const dispatch = useAppDispatch();
  const editing = useSliceSelector(({ editing }) => editing);
  const head = unit.head !== null && tree.nodes[unit.head];

  return (
    <Stack onMouseDown={(event) => event.stopPropagation()} textAlign="center">
      <Text
        fontSize="xl"
        p={1}
        borderRadius={2}
        onClick={() => editing && dispatch(actions.nodeOpened(unit.id))}
        _hover={{
          bg: editing ? "gray.5" : undefined,
          cursor: editing ? "pointer" : undefined,
        }}
      >
        {unit.name}
      </Text>
      {head && head.kind === "user" && (
        <UserLink
          justify="center"
          userId={head.id}
          fullname={`${head.lastName} ${head.firstName} ${head.patronym ?? ""}`}
        />
      )}
    </Stack>
  );
};

export const NodeView = ({ tree, node }: { tree: Tree; node: TreeNode }) => {
  return node.kind === "user" ? (
    <UserNodeView user={node} />
  ) : (
    <UnitNodeView tree={tree} unit={node} />
  );
};

export const NodeCard = () => {
  const dispatch = useAppDispatch();
  const isOpened = useSliceSelector((state) => state.node !== undefined);

  return (
    <Dialog.Root
      lazyMount
      open={isOpened}
      onOpenChange={() => dispatch(actions.nodeClosed())}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Редактирование</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <form onSubmit={() => dispatch(actions.nodeSaved())}>
                <Body />
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Отменить</Button>
              </Dialog.ActionTrigger>
              <Button onClick={() => dispatch(actions.nodeSaved())}>
                Сохранить
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

const Body = () => {
  const dispatch = useAppDispatch();
  const node = useSliceSelector(({ node }) => node);

  if (!node) return;

  return (
    <Stack>
      {node.kind === "unit" && (
        <>
          <Field.Root>
            <Field.Label>Наименование структурного подразделения</Field.Label>
            <Input
              value={node.name}
              onChange={(e) =>
                dispatch(actions.unitEdited({ name: e.target.value }))
              }
            />
          </Field.Root>
          <UserSelect
            label="Начальник или руководитель"
            placeholder="Выберите сотрудника"
            value={node.head ? [node.head] : []}
            onValueChange={(e) =>
              dispatch(actions.unitEdited({ head: e.value[0] }))
            }
          />
          <UserSelect
            label="Супервизор"
            placeholder="Выберите сотрудника"
            value={node.supervisor ? [node.supervisor] : []}
            onValueChange={(e) =>
              dispatch(actions.unitEdited({ supervisor: e.value[0] }))
            }
          />
        </>
      )}
    </Stack>
  );
};

const UserSelect = ({
  value,
  ...rest
}: { label?: string; placeholder: string } & Omit<
  Combobox.RootProps,
  "collection" | "defaultValue"
>) => {
  const orgId = useSliceSelector(({ tree }) => tree?.orgId) ?? null;
  const { user } = useFetchUser(
    value && value[0] ? O.some(value[0]) : O.none(),
  );
  const { data } = useFetchUsers({ orgId });

  if (!value || !value[0]) {
    return <UserSelectLoaded users={data.users} value={value} {...rest} />;
  }

  if (!user) return;

  const users = new Map([[user.id, user], ...data.users.entries()]);

  return <UserSelectLoaded users={users} value={value} {...rest} />;
};

const UserSelectLoaded = ({
  users,
  label,
  placeholder,
  value,
  ...rest
}: { users: Map<string, User>; label?: string; placeholder: string } & Omit<
  Combobox.RootProps,
  "collection"
>) => {
  const { contains } = useFilter({ sensitivity: "base" });

  const items = useMemo(
    () =>
      [...users.values()].map((user) => ({
        value: user.id,
        label: fullNameLong(user),
      })),
    [users],
  );

  const { collection, filter, set } = useListCollection({
    initialItems: items,
    filter: contains,
  });

  useEffect(() => set(items), [set, items]);

  return (
    <Combobox.Root
      openOnClick
      collection={collection}
      onInputValueChange={(e) => filter(e.inputValue)}
      value={value}
      defaultValue={value}
      {...rest}
    >
      <Combobox.Label>{label}</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder={placeholder} />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content>
          {collection.items.map((item) => (
            <Combobox.Item item={item} key={item.value}>
              <Box>
                <Icon>
                  <LuUser />
                </Icon>{" "}
                {item.label}
              </Box>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          ))}
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
};
