import { FormEventHandler, useEffect, useRef, useState } from "react";

import { Option as O } from "effect";
import { useNavigate, useParams } from "react-router-dom";

import { Stack, VisuallyHidden } from "@chakra-ui/react";

import { useAuth } from "@/features/auth/slice";
import { useUserState } from "@/features/user/hooks";
import {
  saveUser,
  useFetchUser,
  UserNotFoundError,
} from "@/features/user/services";

import { Page } from "@/features/App/comps/Page";
import { PageHeading } from "@/features/App/comps/PageHeading.tsx";
import { Button } from "@/shared/comps/Button";
import { fullNameLong } from "@/shared/utils";

import { ProfileCard } from "./comps/ProfileCard";
import { Section } from "./parts/Section";

import { AboutSubsection } from "./subsection/AboutSubsection";
import { AwardsSubsection } from "./subsection/AwardsSubsection";
import { CareerSubsection } from "./subsection/CareerSubsection";
import { CommunitySubsection } from "./subsection/CommunitySubsection";
import { CoursesSubsection } from "./subsection/CoursesSubsection";
import { EducationSubsection } from "./subsection/EducationSubsection";
import { TeamSubsection } from "./subsection/TeamSubsection";
import { TrainingSubsection } from "./subsection/TrainingSubsection";

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

export const ProfilePage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const auth = useAuth();
  const userId = params.userId ?? auth.userId;
  const { user, error } = useFetchUser(O.some(userId));
  const [userState, updateUserState] = useUserState(user);

  const submitBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!params.userId && userId) {
      navigate(`/profile/${userId}`);
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

  const editable =
    user.id === auth.userId ||
    auth.groups.includes("edit-profile-any") ||
    (auth.groups.includes("edit-profile-sameorg") &&
      auth.orgId &&
      O.getOrNull(user.organization)?.id === auth.orgId);

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    if (editing) {
      saveUser(auth.token, userState).catch(() => updateUserState(user));
    }
    setEditing(false);
  };

  return (
    <Page
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
      <PageHeading
        title={user.id === auth.userId ? "Мой профиль" : fullNameLong(user)}
      />

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

          <Section show={editing || userState.about.length > 0}>
            <AboutSubsection
              title="Обо мне"
              about={userState.about}
              editing={editing}
              updateUser={updateUserState}
            />
          </Section>

          <Section
            show={
              editing ||
              userState.education.length > 0 ||
              userState.courses.length > 0
            }
          >
            <EducationSubsection
              title="Образование"
              education={userState.education}
              editing={editing}
              updateUser={updateUserState}
            />

            <CoursesSubsection
              title="Курсы"
              courses={userState.courses}
              editing={editing}
              updateUser={updateUserState}
            />
          </Section>

          <Section
            show={
              editing ||
              userState.career.length > 0 ||
              userState.training.length > 0
            }
          >
            <CareerSubsection
              title="Карьера и развитие"
              career={userState.career}
              editing={editing}
              updateUser={updateUserState}
            />

            <TrainingSubsection
              title="Повышение квалификации"
              training={userState.training}
              editing={editing}
              updateUser={updateUserState}
            />
          </Section>

          <Section>
            <TeamSubsection title="Команда" user={userState} />
          </Section>

          <Section show={editing || userState.communityWork.length > 0}>
            <CommunitySubsection
              title="Общественная деятельность"
              communityWork={userState.communityWork}
              editing={editing}
              updateUser={updateUserState}
            />
          </Section>

          <Section show={editing || userState.awards.length > 0}>
            <AwardsSubsection
              title="Достижения"
              awards={userState.awards}
              editing={editing}
              updateUser={updateUserState}
            />
          </Section>
        </Stack>
      </Stack>
    </Page>
  );
};
