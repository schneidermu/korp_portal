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
  Show,
  Stack,
  StackProps,
  Text,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { Option as O } from "effect";

import {
  isBoss,
  isDescendantOf,
  TreeNode,
  UnitNode,
  UserNode,
} from "@/features/UserTree/types";
import { LuUser } from "@/shared/icons/LuUser";

import { useAppDispatch } from "@/app/store";
import { useFetchUser, useFetchUsers } from "@/features/user/services";
import { User } from "@/features/user/types";
import { fullNameLong } from "@/shared/utils";
import { actions, useSliceSelector } from "../slice";
import { Tree } from "../types";
import { useEffect, useMemo } from "react";
import { useFetchOrg } from "@/features/org/services.ts";

const UserLink = ({
  userId,
  fullname,
  ...rest
}: {
  userId: string;
  fullname: string;
} & StackProps) => {
  const editing = useSliceSelector(({ editing }) => editing);

  return editing ? (
    <HStack {...rest}>
      <Icon>
        <LuUser />
      </Icon>
      <Text color="blue.5">{fullname}</Text>
    </HStack>
  ) : (
    <HStack
      asChild
      _hover={{ textDecoration: "underline" }}
      cursor="pointer"
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
  const head = unit.head !== null && tree.nodes[unit.head];

  return (
    <Stack textAlign="center" onMouseDown={(event) => event.stopPropagation()}>
      <Text fontSize="xl" p={1} borderRadius={2}>
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

export const UnitNodeEditorDialog = () => {
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
        <Dialog.Positioner asChild>
          <form
            action={async () => {
              dispatch(actions.nodeSaved());
            }}
          >
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Редактирование</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <UnitNodeEditor />
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Отменить</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" colorPalette="blue">
                  Сохранить
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </form>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

const UnitNodeEditor = (props: StackProps) => {
  const tree = useSliceSelector(({ tree }) => tree);
  const unit = useSliceSelector(({ node }) => node);
  const dispatch = useAppDispatch();

  if (!tree || !unit || unit.kind !== "unit") return;

  const descendantUnits = Object.values(tree.nodes)
    .filter(
      (node) => node.kind === "unit" && isDescendantOf(tree, node.id, unit.id),
    )
    .map(({ id }) => id);

  return (
    <Stack gap={5} {...props}>
      <Field.Root>
        <Field.Label>Наименование структурного подразделения</Field.Label>
        <Input
          value={unit.name}
          onChange={(e) =>
            dispatch(actions.unitEdited({ name: e.target.value }))
          }
        />
      </Field.Root>
      <UserSelect
        label="Начальник или руководитель подразделения"
        placeholder="Выберите сотрудника"
        hint="Из числа сотрудников подразделения"
        value={unit.head ? [unit.head] : []}
        filter={(user) =>
          unit.head !== user.id &&
          O.getOrNull(user.unit)?.id.toString() === unit.id
        }
        onValueChange={(e) =>
          dispatch(actions.unitEdited({ head: e.value[0] }))
        }
      />
      {/* For non-root units. */}
      <Show when={unit.parent !== null || unit.supervisor !== null}>
        <UnitSelect
          label="Родительское структурное подразделение"
          placeholder="Выберите подразделение"
          hint={
            unit.supervisor !== null
              ? "Не используется при указании супервизора"
              : undefined
          }
          disabled={unit.supervisor !== null}
          value={unit.parent ? [unit.parent] : []}
          filter={(id) => !isDescendantOf(tree, id, unit.id)}
          onValueChange={(e) =>
            dispatch(actions.unitEdited({ parent: e.value[0] ?? null }))
          }
        />
        <UserSelect
          label="Супервизор"
          placeholder="Выберите сотрудника"
          value={unit.supervisor ? [unit.supervisor] : []}
          group={(user) =>
            O.map(user.unit, ({ name }) => name).pipe(O.getOrElse(() => ""))
          }
          filter={(user) =>
            !isBoss(tree, user) &&
            O.map(
              user.unit,
              ({ id }) => !descendantUnits.includes(id.toString()),
            ).pipe(O.getOrElse(() => false))
          }
          onValueChange={(e) =>
            dispatch(actions.unitEdited({ supervisor: e.value[0] ?? null }))
          }
        />
      </Show>
    </Stack>
  );
};

const UserSelect = ({
  value,
  filter,
  ...rest
}: {
  filter?: (user: User) => boolean;
  group?: (user: User) => string;
  label?: string;
  hint?: string;
  placeholder: string;
} & Omit<Combobox.RootProps, "collection" | "defaultValue">) => {
  const orgId = useSliceSelector(({ tree }) => tree?.orgId) ?? null;
  const { user } = useFetchUser(
    value && value[0] ? O.some(value[0]) : O.none(),
  );
  const { data } = useFetchUsers({ orgId });

  const users = new Map(
    [...data.users.entries()].filter(([, user]) => !filter || filter(user)),
  );

  if (!value || !value[0]) {
    return <UserSelectLoaded users={users} value={value} {...rest} />;
  }

  if (!user) return;

  return (
    <UserSelectLoaded
      users={new Map([[user.id, user], ...users.entries()])}
      value={value}
      {...rest}
    />
  );
};

const UserSelectLoaded = ({
  users,
  group,
  ...rest
}: {
  users: Map<string, User>;
  label?: string;
  group?: (user: User) => string;
  hint?: string;
  placeholder: string;
} & Omit<Combobox.RootProps, "collection">) => {
  const items = useMemo(
    () =>
      [...users.values()].map((user) => ({
        value: user.id,
        label: fullNameLong(user),
      })),
    [users],
  );

  return (
    <Select
      items={items}
      group={group && ((id) => group(users.get(id)!))}
      {...rest}
    />
  );
};

const UnitSelect = ({
  filter,
  value,
  ...rest
}: {
  filter?: (unit: string) => boolean;
  label?: string;
  hint?: string;
  placeholder: string;
} & Omit<Combobox.RootProps, "collection" | "defaultValue">) => {
  const orgId = useSliceSelector(({ tree }) => tree?.orgId) ?? null;
  const { data: org } = useFetchOrg(orgId);
  const items = useMemo(
    () =>
      org?.units
        .filter((unit) => !filter || filter(unit.id.toString()))
        .map((unit) => ({
          value: unit.id.toString(),
          label: unit.name,
        })),
    [filter, org],
  );

  if (!items) return;

  return <Select items={items} value={value} {...rest} />;
};

const Select = ({
  items,
  label,
  placeholder,
  value,
  hint,
  group,
  ...rest
}: {
  items: { value: string; label: string }[];
  label?: string;
  hint?: string;
  placeholder: string;
  group?: (value: string) => string;
} & Omit<Combobox.RootProps, "collection">) => {
  const { contains } = useFilter({ sensitivity: "base" });

  const { collection, filter, set } = useListCollection({
    initialItems: items,
    filter: contains,
  });

  useEffect(() => set(items), [set, items]);

  const groups: { [key: string]: typeof items } = {};
  if (group) {
    for (const item of items) {
      const g = group(item.value);
      groups[g] = groups[g] ?? [];
      groups[g].push(item);
    }
  }

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
      <Text fontSize="xs" color="fg.muted">
        {hint}
      </Text>
      <Combobox.Positioner>
        <Combobox.Content>
          {group
            ? Object.entries(groups).map(([name, items]) => (
                <Combobox.ItemGroup key={name}>
                  <Combobox.ItemGroupLabel>{name}</Combobox.ItemGroupLabel>
                  {items.map((item) => (
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
                </Combobox.ItemGroup>
              ))
            : items.map((item) => (
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
