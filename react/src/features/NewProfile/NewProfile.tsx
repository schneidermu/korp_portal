import { FormEventHandler, useState } from "react";

import { Center, Flex, HStack, Show, Stack, Table } from "@chakra-ui/react";

import Sticky from "react-stickynode";

import { useAuth } from "@/features/auth/slice";
import { useUserState } from "@/features/user/hooks";
import { saveUser, useFetchUser } from "@/features/user/services";

import { NavBar } from "@/features/App/parts/NavBar";
import { DPA } from "@/features/dpa/comps/DPA";

import { ProfileCard } from "./comps/ProfileCard";
import { Button } from "./parts/Button";
import { Section } from "./parts/Section";
import { Subsection } from "./parts/Subsection";
import { Timeline } from "./parts/Timeline";

const EditControls = ({
  editing,
  edit,
  reset,
}: {
  editing: boolean;
  edit: () => void;
  reset: () => void;
}) => {
  return (
    <Sticky top={70} innerZ={1}>
      <Flex justify="end">
        {editing ? (
          <HStack gap="6">
            <Button type="submit">Сохранить</Button>
            <Button onClick={reset}>Отменить</Button>
          </HStack>
        ) : (
          <Button onClick={edit}>Изменить данные</Button>
        )}
      </Flex>
    </Sticky>
  );
};

// const Timeline = ({ user, editing }: { user: User; editing: boolean }) => {
//   return (
//     <Grid templateColumns="1fr 1fr 4fr">
//       <Text
//         fontWeight="light"
//         color="gray.2"
//         fontSize="smaller"
//         px="6"
//         pb="4"
//         borderColor="gray.3"
//         borderRightWidth={1}
//         borderBottomWidth={1}
//       >
//         Дата начала
//       </Text>
//       <Text
//         fontWeight="light"
//         color="gray.2"
//         fontSize="smaller"
//         px="6"
//         pb="4"
//         borderColor="gray.3"
//         borderRightWidth={1}
//         borderBottomWidth={1}
//       >
//         Дата окончания
//       </Text>
//       <Text
//         fontWeight="light"
//         color="gray.2"
//         fontSize="smaller"
//         px="6"
//         pb="4"
//         borderColor="gray.3"
//         borderBottomWidth={1}
//       >
//         Курсы
//       </Text>
//
//       {user.courses.map(({ year, name }, i) => (
//         <Fragment key={i}>
//           <Input
//             fontSize="xl"
//             px="6"
//             py="4"
//             borderColor="gray.3"
//             borderRightWidth={1}
//             borderBottomWidth={1}
//             defaultValue={year}
//             outline="none"
//           />
//           <Input
//             fontSize="xl"
//             px="6"
//             py="4"
//             borderColor="gray.3"
//             borderRightWidth={1}
//             borderBottomWidth={1}
//             defaultValue={year}
//             outline="none"
//           />
//           <Input
//             fontSize="xl"
//             px="6"
//             py="4"
//             borderColor="gray.3"
//             borderBottomWidth={1}
//             defaultValue={name}
//             outline="none"
//           />
//         </Fragment>
//       ))}
//     </Grid>
//   );
// };

export const NewProfile = () => {
  const auth = useAuth();
  const { user } = useFetchUser("me");
  const [userState, updateUserState] = useUserState(user);

  const [editing, setEditing] = useState(false);

  if (!user || !userState) return;

  const editable = auth.userId === "me" || auth.userId === auth.userId;

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    if (editing) {
      saveUser(auth.token, userState).catch(() => updateUserState(user));
    }
    setEditing(false);
  };

  return (
    <Center pt="11">
      <Stack w="full" maxW={1440} gap="7">
        <NavBar />

        <Stack gap="7" px="9" as="form" onSubmit={handleSubmit}>
          <Show when={editable}>
            <EditControls
              editing={editing}
              edit={() => setEditing(true)}
              reset={() => {
                updateUserState(user);
                setEditing(false);
              }}
            />
          </Show>

          <Stack gap="4">
            <ProfileCard
              title="Информация о пользователе"
              user={userState}
              editing={editing}
              updateUser={updateUserState}
            />

            <Section>
              <Subsection title="Образование">
                <Table.Root size="sm">
                  <Table.Header fontSize="smaller">
                    <Table.Row borderBottomWidth={1} borderColor="gray.3">
                      <Table.ColumnHeader
                        w="1/6"
                        color="gray.2"
                        borderRightWidth={1}
                        borderColor="gray.3"
                        fontWeight="light"
                      >
                        Дата начала
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        w="1/6"
                        color="gray.2"
                        borderRightWidth={1}
                        borderColor="gray.3"
                        fontWeight="light"
                      >
                        Дата окончания
                      </Table.ColumnHeader>
                      <Table.ColumnHeader color="gray.2" fontWeight="light">
                        Университет
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body fontSize="xl">
                    {user.career.map(
                      ({ year_start, year_leave, position }, i) => (
                        <Table.Row
                          key={i}
                          borderBottomWidth={1}
                          borderColor="gray.3"
                        >
                          <Table.Cell borderRightWidth={1} borderColor="gray.3">
                            {year_start}
                          </Table.Cell>
                          <Table.Cell borderRightWidth={1} borderColor="gray.3">
                            {year_leave ?? "н. вр."}
                          </Table.Cell>
                          <Table.Cell>{position}</Table.Cell>
                        </Table.Row>
                      ),
                    )}
                  </Table.Body>
                </Table.Root>
              </Subsection>
              <Subsection title="Курсы">
                <Timeline
                  editing={editing}
                  headers={["Дата начала", "Дата окончания", "Курсы"]}
                  data={user.courses.map(({ year, name }) => [
                    year.toString(),
                    year.toString(),
                    name,
                  ])}
                  onChange={(i, j, value) => {
                    if (i === 2) {
                      updateUserState((user) => (user.courses[j].name = value));
                    }
                  }}
                  pushRow={() =>
                    updateUserState((user) =>
                      user.courses.push({
                        year:
                          user.courses[user.courses.length - 1]?.year ??
                          new Date().getFullYear(),
                        name: "",
                        attachment: null,
                      }),
                    )
                  }
                  popRow={() => updateUserState((user) => user.courses.pop())}
                />
              </Subsection>
            </Section>

            <Section>
              <Subsection title="Карьера и развитие"></Subsection>
              <Subsection title="Повышение квалификации"></Subsection>
              <Subsection title="Навыки и компетенции"></Subsection>
            </Section>

            <Section>
              <Subsection title="Команда"></Subsection>
            </Section>

            <Section>
              <Subsection title="Общественная деятельность"></Subsection>
            </Section>

            <Section>
              <Subsection title="Награды"></Subsection>
            </Section>

            <Section>
              <Subsection title="Обо мне"></Subsection>
            </Section>
          </Stack>
        </Stack>
      </Stack>
      <DPA />
    </Center>
  );
};
