import {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Option as O } from "effect";

import {
  Flex,
  HStack,
  IconButton,
  Input,
  Show,
  Stack,
  Tag,
  Text,
  Textarea,
  Wrap,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";

import { useAuth } from "@/features/auth/slice";
import { useUserState } from "@/features/user/hooks";
import {
  saveUser,
  useFetchUser,
  UserNotFoundError,
} from "@/features/user/services";
import { UpdateUserFn, User } from "@/features/user/types";

import { TeamSubsection } from "./subsection/TeamSubsection";

import { ProfileCard } from "./comps/ProfileCard";
import { Button } from "./parts/Button";
import { ImageGrid, ImgWithCaption } from "./parts/ImageGrid";
import { Section } from "./parts/Section";
import { Subsection } from "./parts/Subsection";
import { Timeline } from "./parts/Timeline";
import { useNavigate, useParams } from "react-router-dom";

const toNumberOption = (s: string): O.Option<number> => {
  s = s.replace(/[^0-9]/g, "");
  return O.fromNullable(s ? Number(s) : null);
};

const toNumber = (s: string): number => O.getOrThrow(toNumberOption(s));

const EducationSubsection = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  return (
    <Timeline
      editing={editing}
      cols={["Дата начала", "Дата окончания", "Университет"]}
      data={user.education.map(({ year, university }) => [
        year ? year.toString() : "",
        year ? year.toString() : "",
        university,
      ])}
      onChange={(col, i, value) => {
        if (col === "Университет") {
          updateUser((user) => (user.education[i].university = value));
        } else {
          updateUser((user) => (user.education[i].year = toNumber(value)));
        }
      }}
      pushRow={() =>
        updateUser((user) =>
          user.education.push({
            year:
              user.education[user.education.length - 1]?.year ??
              new Date().getFullYear(),
            university: "",
            major: "",
          }),
        )
      }
      popRow={() => updateUser((user) => user.education.pop())}
    />
  );
};

const CoursesSubsection = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  return (
    <Timeline
      editing={editing}
      cols={["Дата начала", "Дата окончания", "Курсы"]}
      data={user.courses.map(({ year, name }) => [
        year ? year.toString() : "",
        year ? year.toString() : "",
        name,
      ])}
      onChange={(col, i, value) => {
        if (col === "Курсы") {
          updateUser((user) => (user.courses[i].name = value));
        } else {
          updateUser((user) => (user.courses[i].year = toNumber(value)));
        }
      }}
      pushRow={() =>
        updateUser((user) =>
          user.courses.push({
            year:
              user.courses[user.courses.length - 1]?.year ??
              new Date().getFullYear(),
            name: "",
            attachment: O.none(),
          }),
        )
      }
      popRow={() => updateUser((user) => user.courses.pop())}
    />
  );
};

const CareerSubsection = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  return (
    <Timeline
      editing={editing}
      cols={["Дата начала", "Дата окончания", "Должность"]}
      data={user.career.map(({ year_start, year_leave, position }) => [
        year_start ? year_start.toString() : "",
        O.match(year_leave, {
          onNone: () => "н. вр.",
          onSome: (y) => y.toString(),
        }),
        position,
      ])}
      onChange={(col, i, value) => {
        if (col === "Дата начала") {
          updateUser((user) => (user.career[i].year_start = toNumber(value)));
        } else if (col === "Дата окончания") {
          updateUser(
            (user) => (user.career[i].year_leave = toNumberOption(value)),
          );
        } else if (col === "Должность") {
          updateUser((user) => (user.career[i].position = value));
        }
      }}
      pushRow={() =>
        updateUser((user) =>
          user.career.push({
            month_start: O.none(),
            month_leave: O.none(),
            year_start: 0,
            year_leave: O.some(
              user.career[user.career.length - 1]?.year_start ??
                new Date().getFullYear(),
            ),
            position: "",
          }),
        )
      }
      popRow={() => updateUser((user) => user.courses.pop())}
    />
  );
};

const TrainingSubsection = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  return (
    <Timeline
      editing={editing}
      cols={["Дата начала", "Дата окончания", "Квалификация"]}
      data={user.training.map(({ name }) => ["2025", "2025", name])}
      onChange={(col, i, value) => {
        if (col === "Квалификация") {
          updateUser((user) => (user.training[i].name = value));
        }
      }}
      pushRow={() =>
        updateUser((user) =>
          user.training.push({
            name: "",
            attachment: O.none(),
          }),
        )
      }
      popRow={() => updateUser((user) => user.training.pop())}
    />
  );
};

const SkillsSubsection = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  const skills = O.getOrNull(user.skills)?.split(", ") || [];
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    updateUser(
      (user) =>
        (user.skills = O.some(
          O.match(user.skills, {
            onNone: () => newSkill,
            onSome: (skills) => [skills, newSkill].join(", "),
          }),
        )),
    );
    setNewSkill("");
  };

  const removeSkill = (i: number) =>
    updateUser((user) => {
      const s = [...skills];
      s.splice(i, 1);
      user.skills = O.some(s.join(", "));
    });

  return (
    <Wrap fontSize="md" gapX="4" gapY="2">
      {[...skills].map((skill, i) => (
        <Tag.Root
          key={i}
          color="blue.1"
          bg="blue.3"
          borderRadius="small"
          px="3"
          py="1"
        >
          <Tag.Label>{skill}</Tag.Label>
          {editing && (
            <Tag.EndElement>
              <Tag.CloseTrigger type="button" onClick={() => removeSkill(i)} />
            </Tag.EndElement>
          )}
        </Tag.Root>
      ))}
      {editing && (
        <Tag.Root color="blue.1" bg="blue.3" borderRadius="small" px="3" py="1">
          <Tag.StartElement asChild>
            <IconButton minW="0" onClick={addSkill}>
              <LuPlus />
            </IconButton>
          </Tag.StartElement>
          <Tag.Label>
            <Input
              width="20"
              height="auto"
              outline="none"
              value={newSkill}
              placeholder="Новый навык"
              onChange={({ target }) => setNewSkill(target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && newSkill) {
                  event.preventDefault();
                  addSkill();
                }
              }}
            />
          </Tag.Label>
        </Tag.Root>
      )}
    </Wrap>
  );
};

const CommunitySubsection = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  const onChange = useCallback(
    (i: number, img: ImgWithCaption) =>
      updateUser(
        (user) =>
          (user.communityWork[i] = {
            name: img.caption,
            attachment: img.src,
          }),
      ),
    [updateUser],
  );

  const onAdd = useCallback(
    () =>
      updateUser((user) =>
        user.communityWork.push({ name: "", attachment: O.none() }),
      ),
    [updateUser],
  );

  const onRemove = useCallback(
    (i: number) => updateUser((user) => user.communityWork.splice(i, 1)),
    [updateUser],
  );

  const imgs = useMemo(
    () =>
      user.communityWork.map(({ name, attachment }) => ({
        src: attachment,
        caption: name,
      })),
    [user.communityWork],
  );

  return (
    <ImageGrid
      editing={editing}
      imgs={imgs}
      onAdd={onAdd}
      onRemove={onRemove}
      onChange={onChange}
    />
  );
};

const AwardsSubsection = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  const onChange = useCallback(
    (i: number, img: ImgWithCaption) =>
      updateUser(
        (user) =>
          (user.awards[i] = {
            name: img.caption,
            attachment: img.src,
          }),
      ),
    [updateUser],
  );

  const onAdd = useCallback(
    () =>
      updateUser((user) =>
        user.awards.push({ name: "", attachment: O.none() }),
      ),
    [updateUser],
  );

  const onRemove = useCallback(
    (i: number) => updateUser((user) => user.awards.splice(i, 1)),
    [updateUser],
  );

  const imgs = useMemo(
    () =>
      user.awards.map(({ name, attachment }) => ({
        src: attachment,
        caption: name,
      })),
    [user.awards],
  );

  return (
    <ImageGrid
      editing={editing}
      imgs={imgs}
      onAdd={onAdd}
      onRemove={onRemove}
      onChange={onChange}
    />
  );
};

const AboutSubsection = ({
  user,
  editing,
  updateUser,
}: {
  user: User;
  editing: boolean;
  updateUser: UpdateUserFn;
}) => {
  if (editing)
    return (
      <Textarea
        disabled={!editing}
        value={user.about}
        onChange={({ target }) => updateUser({ ...user, about: target.value })}
        rows={4}
        px="3"
        py="2"
        fontSize="md"
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="2"
      />
    );
  return (
    <Stack fontSize="2xl">
      {user.about
        .trim()
        .split("\n")
        .map(
          (para) =>
            para && (
              <Text as="p" key={para}>
                {para}
              </Text>
            ),
        )}
    </Stack>
  );
};

const EditControls = ({
  editable,
  editing,
  edit,
  reset,
}: {
  editable: boolean;
  editing: boolean;
  edit: () => void;
  reset: () => void;
}) => {
  return (
    <Show when={editable}>
      <Flex justify="end" position="sticky" top="10" zIndex="1" mr="4">
        {editing ? (
          <HStack gap="6">
            <Button variant="solid" type="submit">
              Сохранить
            </Button>
            <Button variant="outline" onClick={reset}>
              Отменить
            </Button>
          </HStack>
        ) : (
          <Button variant="solid" onClick={edit}>
            Изменить данные
          </Button>
        )}
      </Flex>
    </Show>
  );
};

const NewProfile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const auth = useAuth();
  const userId = params.userId ?? auth.userId;
  const { user, error } = useFetchUser(O.some(userId));
  const [userState, updateUserState] = useUserState(user);

  useEffect(() => {
    if (!params.userId && userId) {
      navigate(`/new-profile/${userId}`);
    }
  }, [navigate, params.userId, userId]);

  useEffect(() => {
    if (error === UserNotFoundError) {
      navigate(`/404`);
    }
  }, [navigate, error]);

  useEffect(() => {
    if (!user) return;
    let name = user.firstName;
    if (O.isSome(user.patronym)) {
      name += " " + user.patronym.value;
    }
    document.title = `${name} | КП`;
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setEditing(false);
  }, [user?.id]);

  const [editing, setEditing] = useState(false);

  if (!user || !userState) return;

  const editable = user.id === auth.userId;

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    if (editing) {
      saveUser(auth.token, userState).catch(() => updateUserState(user));
    }
    setEditing(false);
  };

  return (
    <Stack position="relative" w={1440} gap="7">
      <Stack gap="7" px="9" as="form" onSubmit={handleSubmit}>
        <EditControls
          editable={editable}
          editing={editing}
          edit={() => setEditing(true)}
          reset={() => {
            updateUserState(user);
            setEditing(false);
          }}
        />

        <Stack gap="4">
          <ProfileCard
            title="Информация о пользователе"
            user={userState}
            editing={editing}
            updateUser={updateUserState}
          />

          <Section>
            <Subsection title="Образование">
              <EducationSubsection
                user={userState}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>

            <Subsection title="Курсы">
              <CoursesSubsection
                user={userState}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>

          <Section>
            <Subsection title="Карьера и развитие">
              <CareerSubsection
                user={userState}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>

            <Subsection title="Повышение квалификации">
              <TrainingSubsection
                user={userState}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
            <Subsection title="Навыки и компетенции">
              <SkillsSubsection
                user={userState}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>

          <Section>
            <Subsection title="Команда">
              <TeamSubsection user={userState} />
            </Subsection>
          </Section>

          <Section>
            <Subsection title="Общественная деятельность">
              <CommunitySubsection
                user={userState}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>

          <Section>
            <Subsection title="Награды">
              <AwardsSubsection
                user={userState}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>

          <Section>
            <Subsection title="Обо мне">
              <AboutSubsection
                user={userState}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>
        </Stack>
      </Stack>
    </Stack>
  );
};

export const NewProfilePage = () => {
  return (
    <Stack position="relative" w={1440} gap="7" pb="20">
      <NewProfile />
    </Stack>
  );
};
