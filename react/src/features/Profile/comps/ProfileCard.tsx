import React from "react";

import { Option as O } from "effect";

import {
  Box,
  createListCollection,
  Flex,
  Grid,
  Stack,
  StackProps,
  Text,
} from "@chakra-ui/react";

import {
  UpdateUserFn,
  User,
  USER_STATUS,
  UserStatus,
} from "@/features/user/types";
import {
  formatMobilePhone,
  NBSP,
  noop,
  stripPhoneNumber,
} from "@/shared/utils";

import { UserSkills } from "@/features/Skills/Skills";
import { Rating } from "@/features/rating/comps/Rating";
import { Avatar, AvatarEditable } from "@/features/user/comps/Avatar";

import { Field } from "../parts/Field";
import { FieldValue } from "../parts/FieldValue";
import { Input } from "../parts/Input";
import { Section } from "../parts/Section";
import { Select } from "../parts/Select";
import { Subsection } from "../parts/Subsection";

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
              items: (USER_STATUS as readonly string[]).map((status) => ({
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
            maxLength={20}
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
            maxLength={100}
            value={info.position}
            onChange={({ target: { value } }) =>
              updateUser((user) => (user.position = value))
            }
          />
        </Field>

        <Field label="Классный чин" editing={editing}>
          <Input
            editing={editing}
            maxLength={20}
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
  (prev, next) =>
    prev.editing === next.editing &&
    prev.updateUser === next.updateUser &&
    INFO_FIELDS.every((field) => prev.info[field] === next.info[field]),
);

interface ProfileCardProps extends StackProps {
  user: User;
  editing?: boolean;
  updateUser?: UpdateUserFn;
  title?: string;
  highlightSkills?: string[];
}

export const ProfileCard = React.memo(
  React.forwardRef<HTMLDivElement, ProfileCardProps>(
    function ProfileCard(props, ref) {
      const {
        user,
        editing = false,
        updateUser = noop,
        title,
        highlightSkills,
        ...rest
      } = props;

      return (
        <Section ref={ref} {...rest}>
          <Subsection title={title}>
            <Flex>
              <Stack gap="6" mt="4" flexShrink="0" w="72">
                <Flex justify="center" mr="16">
                  <Box w="52" h="52">
                    {editing ? (
                      <AvatarEditable
                        w="full"
                        h="full"
                        user={user}
                        onUpload={(src) =>
                          updateUser((user) => (user.photo = O.some(src)))
                        }
                      />
                    ) : (
                      <Avatar user={user} w="full" h="full" />
                    )}
                  </Box>
                </Flex>
                <Box ml="8">
                  <Rating user={user} />
                </Box>
              </Stack>

              <InfoGrid info={user} editing={editing} updateUser={updateUser} />
            </Flex>
            {(editing || user.skills.length > 0) && (
              <UserSkills
                editing={editing}
                skills={user.skills}
                updateUser={updateUser}
                highlightSkills={highlightSkills}
              />
            )}
          </Subsection>
        </Section>
      );
    },
  ),
);
