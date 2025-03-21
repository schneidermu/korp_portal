import React, {
  FormEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Option as O } from "effect";
import { useNavigate, useParams } from "react-router-dom";

import { Stack, Text, Textarea, VisuallyHidden } from "@chakra-ui/react";

import { useAuth } from "@/features/auth/slice";
import { useUserState } from "@/features/user/hooks";
import {
  saveUser,
  useFetchUser,
  UserNotFoundError,
} from "@/features/user/services";
import { UpdateUserFn, User } from "@/features/user/types";

import { NewPage } from "@/features/App/comps/NewPage";

import { SkillsSubsection } from "./subsection/SkillsSubsection";
import { TeamSubsection } from "./subsection/TeamSubsection";

import { ProfileCard } from "./comps/ProfileCard";
import { Button } from "./parts/Button";
import { ImageGrid, ImgWithCaption } from "./parts/ImageGrid";
import { Section } from "./parts/Section";
import { Subsection } from "./parts/Subsection";
import { Timeline } from "./parts/Timeline";

const toNumberOption = (s: string): O.Option<number> => {
  s = s.replace(/[^0-9]/g, "");
  return O.fromNullable(s ? Number(s) : null);
};

const toNumber = (s: string): number => O.getOrThrow(toNumberOption(s));

const EducationSubsection = React.memo(function EducationSubsection({
  education,
  editing,
  updateUser,
}: {
  education: User["education"];
  editing: boolean;
  updateUser: UpdateUserFn;
}) {
  return (
    <Timeline
      editing={editing}
      cols={["Дата начала", "Дата окончания", "Университет"]}
      data={education.map(({ year, university }) => [
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
});

const CoursesSubsection = React.memo(function CoursesSubsection({
  courses,
  editing,
  updateUser,
}: {
  courses: User["courses"];
  editing: boolean;
  updateUser: UpdateUserFn;
}) {
  return (
    <Timeline
      editing={editing}
      cols={["Дата начала", "Дата окончания", "Курсы"]}
      data={courses.map(({ year, name }) => [
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
});

const CareerSubsection = React.memo(function CareerSubsection({
  career,
  editing,
  updateUser,
}: {
  career: User["career"];
  editing: boolean;
  updateUser: UpdateUserFn;
}) {
  return (
    <Timeline
      editing={editing}
      cols={["Дата начала", "Дата окончания", "Должность"]}
      data={career.map(({ year_start, year_leave, position }) => [
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
      popRow={() => updateUser((user) => user.career.pop())}
    />
  );
});

const TrainingSubsection = React.memo(function TrainingSubsection({
  training,
  editing,
  updateUser,
}: {
  training: User["training"];
  editing: boolean;
  updateUser: UpdateUserFn;
}) {
  return (
    <Timeline
      editing={editing}
      cols={["Дата начала", "Дата окончания", "Квалификация"]}
      data={training.map(({ name }) => ["2025", "2025", name])}
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
});

const CommunitySubsection = React.memo(function CommunitySubsection({
  communityWork,
  editing,
  updateUser,
}: {
  communityWork: User["communityWork"];
  editing: boolean;
  updateUser: UpdateUserFn;
}) {
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
      communityWork.map(({ name, attachment }) => ({
        src: attachment,
        caption: name,
      })),
    [communityWork],
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
});

const AwardsSubsection = React.memo(function AwardsSubsection({
  awards,
  editing,
  updateUser,
}: {
  awards: User["awards"];
  editing: boolean;
  updateUser: UpdateUserFn;
}) {
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
      awards.map(({ name, attachment }) => ({
        src: attachment,
        caption: name,
      })),
    [awards],
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
});

const AboutSubsection = React.memo(function About({
  about,
  editing,
  updateUser,
}: {
  about: User["about"];
  editing: boolean;
  updateUser: UpdateUserFn;
}) {
  if (editing)
    return (
      <Textarea
        disabled={!editing}
        value={about}
        onChange={({ target }) =>
          updateUser((user) => (user.about = target.value))
        }
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
      {about
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
});

const EditControls = ({
  editing,
  onEdit,
  onReset,
  onSave,
}: {
  editing: boolean;
  onEdit: () => void;
  onReset: () => void;
  onSave: () => void;
}) => {
  return (
    <Stack gap="6">
      {editing ? (
        <>
          <Button variant="outline" onClick={onReset}>
            Отменить
          </Button>
          <Button variant="solid" onClick={onSave}>
            Сохранить
          </Button>
        </>
      ) : (
        <Button variant="solid" onClick={onEdit}>
          Изменить данные
        </Button>
      )}
    </Stack>
  );
};

export const NewProfilePage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const auth = useAuth();
  const userId = params.userId ?? auth.userId;
  const { user, error } = useFetchUser(O.some(userId));
  const [userState, updateUserState] = useUserState(user);

  const submitBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!params.userId && userId) {
      navigate(`/new/profile/${userId}`);
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
    <NewPage
      sidebar={
        editable && (
          <EditControls
            editing={editing}
            onEdit={() => setEditing(true)}
            onReset={() => {
              updateUserState(user);
              setEditing(false);
            }}
            onSave={() => submitBtnRef.current && submitBtnRef.current.click()}
          />
        )
      }
    >
      <Stack gap="7" as="form" onSubmit={handleSubmit}>
        <VisuallyHidden>
          {/* Dummy submit button to trigger input submits with Enter.
              Also used to submit via the ref. */}
          <Button type="submit" ref={submitBtnRef} />
        </VisuallyHidden>

        <Stack gap="4">
          <ProfileCard
            title="Информация о пользователе"
            user={userState}
            editing={editing}
            updateUser={updateUserState}
          />

          <Section>
            <Subsection title="Обо мне">
              <AboutSubsection
                about={userState.about}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>

          <Section>
            <Subsection title="Образование">
              <EducationSubsection
                education={userState.education}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>

            <Subsection title="Курсы">
              <CoursesSubsection
                courses={userState.courses}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>

          <Section>
            <Subsection title="Карьера и развитие">
              <CareerSubsection
                career={userState.career}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>

            <Subsection title="Повышение квалификации">
              <TrainingSubsection
                training={userState.training}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>

            <Subsection title="Навыки и компетенции">
              <SkillsSubsection
                skills={userState.skills}
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
                communityWork={userState.communityWork}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>

          <Section>
            <Subsection title="Награды">
              <AwardsSubsection
                awards={userState.awards}
                editing={editing}
                updateUser={updateUserState}
              />
            </Subsection>
          </Section>
        </Stack>
      </Stack>
    </NewPage>
  );
};
