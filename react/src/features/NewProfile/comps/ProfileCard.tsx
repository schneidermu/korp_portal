import React from "react";

import { Option as O } from "effect";

import {
  UpdateUserFn,
  User,
  USER_STATUS,
  UserStatus,
} from "@/features/user/types";
import { formatMobilePhone, NBSP, stripPhoneNumber } from "@/shared/utils";

import { Avatar } from "../parts/Avatar";

import { Rating } from "@/features/rating/comps/Rating";
import {
  createListCollection,
  Flex,
  Grid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Field } from "../parts/Field";
import { FieldValue } from "../parts/FieldValue";
import { Input } from "../parts/Input";
import { Section } from "../parts/Section";
import { Select } from "../parts/Select";
import { Subsection } from "../parts/Subsection";

import fallbackAvatar from "@/assets/avatar-fallback.svg";

const INFO_FIELDS = [
  "lastName",
  "firstName",
  "patronym",
  "status",
  "dateOfBirth",
  "phoneNumber",
  "email",
  "position",
  "serviceRank",
  "unit",
  "organization",
] as const;

type Info = Pick<User, (typeof INFO_FIELDS)[number]>;

export const InfoGrid = React.memo(
  function InfoGrid({
    info,
    editing,
    updateUser,
  }: {
    info: Info;
    editing: boolean;
    updateUser: UpdateUserFn;
  }) {
    const changePhoneNumber = (phone: string) => {
      const phoneValue = stripPhoneNumber(phone);
      const prettyPhone = formatMobilePhone(phoneValue);
      if (prettyPhone === phoneValue) {
        updateUser((user) => (user.phoneNumber = phone));
      } else {
        updateUser((user) => (user.phoneNumber = prettyPhone));
      }
    };

    return (
      <Grid w="full" templateColumns="repeat(3, 1fr)" columnGap="9" rowGap="5">
        <Field label="Фамилия" editing={editing}>
          <FieldValue editing={editing}>
            <Text w="full">{info.lastName}</Text>
          </FieldValue>
        </Field>

        <Field label="Имя" editing={editing}>
          <FieldValue editing={editing}>
            <Text w="full">{info.firstName}</Text>
          </FieldValue>
        </Field>

        <Field label="Отчество" editing={editing}>
          <FieldValue editing={editing}>
            <Text w="full">{O.getOrUndefined(info.patronym)}</Text>
          </FieldValue>
        </Field>

        <Field label="Статус" editing={editing}>
          <Select
            editing={editing}
            value={[info.status]}
            onValueChange={({ value }) =>
              updateUser((user) => (user.status = value[0] as UserStatus))
            }
            collection={createListCollection({
              items: USER_STATUS.map((status) => ({
                value: status,
                label: status,
              })),
            })}
          />
        </Field>

        <Field label="Дата рождения" editing={editing}>
          <Input
            type="date"
            editing={editing}
            value={O.getOrElse(info.dateOfBirth, () => "")}
            onChange={({ target: { value } }) =>
              updateUser(
                (user) => (user.dateOfBirth = O.fromNullable(value || null)),
              )
            }
          />
        </Field>

        <Field label="Телефон" editing={editing}>
          <Input
            editing={editing}
            value={formatMobilePhone(info.phoneNumber)}
            onChange={({ target: { value } }) => changePhoneNumber(value)}
          />
        </Field>

        <Field label="Почта" editing={editing}>
          <FieldValue editing={editing}>
            <Text w="full">{info.email}</Text>
          </FieldValue>
        </Field>

        <Field label="Должность" editing={editing}>
          <Input
            editing={editing}
            value={info.position}
            onChange={({ target: { value } }) =>
              updateUser((user) => (user.position = value))
            }
          />
        </Field>

        <Field label="Классный чин" editing={editing}>
          <Input
            editing={editing}
            value={info.serviceRank}
            onChange={({ target: { value } }) =>
              updateUser((user) => (user.serviceRank = value))
            }
          />
        </Field>

        <Field
          label="Структурное подразделение"
          editing={editing}
          gridColumn="span 2"
        >
          <FieldValue editing={editing}>
            <Text w="full">{O.getOrNull(info.unit)?.name || NBSP}</Text>
          </FieldValue>
        </Field>

        <Field label="Организация" editing={editing}>
          <FieldValue editing={editing}>
            <Text w="full">{O.getOrNull(info.organization)?.name || NBSP}</Text>
          </FieldValue>
        </Field>
      </Grid>
    );
  },
  (prev, next) => {
    return (
      prev.editing === next.editing &&
      prev.updateUser === next.updateUser &&
      INFO_FIELDS.every((field) => prev.info[field] === next.info[field])
    );
  },
);

export const ProfileCard = ({
  user,
  editing,
  updateUser,
  title,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
  title?: string;
}) => {
  return (
    <Section>
      <Subsection title={title}>
        <Flex>
          <Stack gap="6" px="10" mt="4" align="center" flexShrink="0">
            <Avatar fallbackSrc={fallbackAvatar} user={user} mr="10" />
            <Rating small user={user} />
          </Stack>
          <InfoGrid info={user} editing={editing} updateUser={updateUser} />
        </Flex>
      </Subsection>
    </Section>
  );
};
