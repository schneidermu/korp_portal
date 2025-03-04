import { UpdateUserFn, User, USER_STATUS } from "@/features/user/types";
import { formatMobilePhone, stripPhoneNumber } from "@/shared/utils";

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

export const InfoGrid = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  const changePhoneNumber = (phone: string) => {
    const phoneValue = stripPhoneNumber(phone);
    const prettyPhone = formatMobilePhone(phoneValue);
    if (prettyPhone === phoneValue) {
      updateUser({ ...user, phoneNumber: phone });
    } else {
      updateUser({ ...user, phoneNumber: prettyPhone });
    }
  };

  return (
    <Grid w="full" templateColumns="repeat(3, 1fr)" columnGap="9" rowGap="5">
      <Field required label="Фамилия" editing={editing}>
        <FieldValue editing={editing}>
          <Text w="full">{user.lastName}</Text>
        </FieldValue>
      </Field>

      <Field required label="Имя" editing={editing}>
        <FieldValue editing={editing}>
          <Text w="full">{user.firstName}</Text>
        </FieldValue>
      </Field>

      <Field required label="Отчество" editing={editing}>
        <FieldValue editing={editing}>
          <Text w="full">{user.patronym}</Text>
        </FieldValue>
      </Field>

      <Field required label="Статус" editing={editing}>
        <Select
          editing={editing}
          collection={createListCollection({
            items: USER_STATUS.map((status) => ({
              value: status,
              label: status,
            })),
          })}
        />
      </Field>

      <Field required label="Дата рождения" editing={editing}>
        <Input
          type="date"
          editing={editing}
          value={user.dateOfBirth ?? ""}
          onChange={({ target: { value } }) =>
            updateUser({ ...user, dateOfBirth: value || null })
          }
        />
      </Field>

      <Field required label="Телефон" editing={editing}>
        <Input
          editing={editing}
          value={formatMobilePhone(user.phoneNumber)}
          onChange={({ target: { value } }) => changePhoneNumber(value)}
        />
      </Field>

      <Field label="Почта" editing={editing}>
        <FieldValue editing={editing}>
          <Text w="full">{user.email}</Text>
        </FieldValue>
      </Field>

      <Field required label="Должность" editing={editing}>
        <Input
          editing={editing}
          value={user.position}
          onChange={({ target: { value } }) =>
            updateUser({ ...user, position: value })
          }
        />
      </Field>

      <Field required label="Классный чин" editing={editing}>
        <Input
          editing={editing}
          value={user.serviceRank}
          onChange={({ target: { value } }) =>
            updateUser({ ...user, serviceRank: value })
          }
        />
      </Field>

      <Field
        label="Структурное подразделение"
        editing={editing}
        gridColumn="span 2"
      >
        <FieldValue editing={editing}>
          <Text w="full">{user.unit?.name}</Text>
        </FieldValue>
      </Field>

      <Field label="Организация" editing={editing}>
        <FieldValue editing={editing}>
          <Text w="full">{user.organization?.name}</Text>
        </FieldValue>
      </Field>
    </Grid>
  );
};

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
            <Avatar height="28" width="28" mr="10" user={user} />
            <Rating user={user} />
          </Stack>
          <InfoGrid user={user} editing={editing} updateUser={updateUser} />
        </Flex>
      </Subsection>
    </Section>
  );
};
