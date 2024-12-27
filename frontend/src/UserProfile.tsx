import {
  FormEventHandler,
  HTMLInputTypeAttribute,
  ReactNode,
  useEffect,
  useState,
} from "react";

import clsx from "clsx/lite";

import atIcon from "/at.svg";
import awardIcon from "/award.svg";
import bookIcon from "/book.svg";
import brightnessIcon from "/brightness.svg";
import creditCardIcon from "/credit-card.svg";
import editIcon from "/edit.svg";
import externalIcon from "/external.svg";
import giftIcon from "/gift.svg";
import layersIcon from "/layers.svg";
import layoutIcon from "/layout.svg";
import peopleIcon from "/people.svg";
import personIcon from "/person.svg";
import phoneIcon from "/phone.svg";
import pinIcon from "/pin.svg";
import starIcon from "/star.svg";
import starFillIcon from "/star-fill.svg";
import upArrowIcon from "/up-arrow.svg";

import { User, USER_STATUS, UserStatus } from "./types";

import { useAuth } from "./auth/slice";
import FileAttachment from "./FileAttachment";
import { updateUser, useFetchColleagues, useFetchUser } from "./users/api";
import {
  formatDateOfBirth,
  fullNameLong,
  fullNameShort,
  MonomorphFields,
} from "./util";
import { AnimatePage, PageSkel } from "./Page.tsx";
import { Link, useNavigate, useParams } from "react-router-dom";

function SectionSep() {
  return (
    <hr
      className={clsx(
        "border-[1px] border-medium-gray",
        "mt-[64px] -mr-[10px] mb-[36px] -ml-[36px]",
      )}
    />
  );
}

function Property({
  icon,
  name,
  value,
}: {
  icon: string;
  name: string;
  value?: string;
}) {
  return (
    <div>
      <img
        style={{ width: "30px", height: "30px" }}
        src={icon}
        alt=""
        className="inline-block mr-[20px]"
      />
      <span className="mr-[10px] text-dark-gray">{name}:</span>
      {value}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-[40px] font-medium text-[30px]">{title}</h2>;
}

function Picture({
  url,
  width,
  height,
  alt = "",
}: {
  url?: string;
  width: string;
  height: string;
  alt?: string;
}) {
  return (
    <img
      src={url}
      alt={alt}
      style={{ width, height }}
      className="object-center object-cover"
    />
  );
}

function EditControls({
  editing,
  edit,
  reset,
}: {
  editing: boolean;
  edit: () => void;
  reset: () => void;
}) {
  const btn = clsx(
    "px-[30px] py-[6px] w-fit",
    "rounded bg-light-blue text-white",
    "text-[24px]",
  );

  return editing ? (
    <div className="flex gap-[24px]">
      <button className={btn} key="save" type="submit">
        Сохранить
      </button>
      <button className={btn} key="reset" type="button" onClick={reset}>
        Отменить
      </button>
    </div>
  ) : (
    <button key="edit" type="button" onClick={edit}>
      <img style={{ width: "36px", height: "36px" }} src={editIcon} />
    </button>
  );
}

function EditableProperty({
  icon,
  name,
  wrap = false,
  handleClick,
  children,
}: {
  icon: string;
  name: string;
  wrap?: boolean;
  handleClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div className={clsx("h-full", wrap ? "mt-[7.5px]" : "flex items-center")}>
      <img
        style={{ width: "30px", height: "30px" }}
        src={icon}
        alt=""
        className="inline-block mr-[20px]"
      />
      <span
        className={clsx(
          "inline-block",
          "shrink-0 mr-[10px] text-dark-gray",
          handleClick && "hover:underline cursor-pointer",
        )}
        onClick={handleClick}
      >
        {name}:
      </span>
      {children}
    </div>
  );
}

function PropertyInput({
  type = "text",
  editing,
  pattern,
  value,
  text,
  handleChange,
}: {
  type?: HTMLInputTypeAttribute;
  editing: boolean;
  pattern?: string;
  value: string;
  text?: string;
  handleChange: (value: string) => void;
}) {
  return editing ? (
    <input
      type={type}
      pattern={pattern}
      className={clsx(
        "w-full min-w-0 py-[6px] px-[10px]",
        "border rounded outline-none border-black",
        "invalid:border-[#f00]",
      )}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
    />
  ) : (
    <span>{text || value}</span>
  );
}

function PropertySelect({
  editing,
  value,
  options,
  handleSelect: handleChange,
}: {
  editing: boolean;
  value?: string;
  options?: [string, string][];
  handleSelect: (value: string, text: string) => void;
}) {
  let text = undefined;
  for (const [v, t] of options || []) {
    if (v === value) text = t;
  }

  return editing ? (
    <select
      className={clsx(
        "w-full px-[10px] py-[6px]",
        "outline-none border rounded bg-white border-black",
      )}
      value={value}
      onChange={(e) => handleChange(e.target.value, e.target.textContent || "")}
    >
      {options &&
        options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
    </select>
  ) : (
    <span>{text}</span>
  );
}

export function ProfileCard({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) {
  const navigate = useNavigate();

  const changeField =
    (key: MonomorphFields<User, string | null>) => (value: string) => {
      let v: string | null = value;
      if (key === "dateOfBirth" && !value) {
        v = null;
      }
      setUser({ ...user, [key]: v });
    };

  const viewUnit = () => {
    console.log("view unit");
    if (user.unit === null) return;
    navigate("/list/" + user.unit.name);
  };

  const field = ({
    name,
    icon,
    field,
    type = "text",
    pattern,
    handleClick,
  }: {
    name: string;
    icon: string;
    field: MonomorphFields<User, string | null>;
    type?: string;
    pattern?: string;
    handleClick?: () => void;
  }) => (
    <EditableProperty
      key={field}
      icon={icon}
      name={name}
      handleClick={handleClick}
    >
      <PropertyInput
        type={type}
        pattern={pattern}
        editing={editing}
        value={user[field] || ""}
        text={
          field === "dateOfBirth" && user[field]
            ? formatDateOfBirth(new Date(user[field]))
            : undefined
        }
        handleChange={changeField(field)}
      />
    </EditableProperty>
  );

  return (
    <section className="-ml-[20px] flex gap-[64px] h-[340px]">
      <Link
        to={`/profile/${user.id}`}
        className="shrink-0 rounded-photo overflow-hidden"
      >
        <Picture width="260px" height="100%" url={user.photo || undefined} />
      </Link>
      <div className="w-full flex flex-col justify-between">
        <div className="flex">
          <img src={personIcon} alt="" className="w-[33px]" />
          <Link
            to={"/profile/" + user.id}
            className="ml-[28px] text-[30px] hover:underline"
          >
            <h2>{fullNameLong(user)}</h2>
          </Link>
        </div>
        <div
          className={clsx(
            "grid grid-flow-col grid-rows-[repeat(5,45px)] grid-cols-2",
            "gap-y-[15px] gap-x-[1em]",
          )}
        >
          <EditableProperty key="status" name="Статус" icon={brightnessIcon}>
            <PropertySelect
              editing={editing}
              value={user.status}
              options={USER_STATUS.map((status) => [status, status])}
              handleSelect={(value) => {
                setUser({ ...user, status: value as UserStatus });
              }}
            ></PropertySelect>
          </EditableProperty>
          {[
            field({
              field: "dateOfBirth",
              name: "Дата рождения",
              icon: giftIcon,
              type: "date",
            }),
            field({
              field: "phoneNumber",
              name: "Телефон",
              icon: phoneIcon,
              type: "tel",
            }),
            <EditableProperty key="email" name="Почта" icon={atIcon}>
              {user.email}
            </EditableProperty>,
            field({
              field: "position",
              name: "Должность",
              icon: peopleIcon,
            }),
            field({
              field: "serviceRank",
              name: "Классный чин",
              icon: awardIcon,
            }),
          ]}
          <EditableProperty
            key="organization"
            name="Организация"
            icon={pinIcon}
          >
            {user.organization?.name}
          </EditableProperty>
          <div className="row-span-3">
            <EditableProperty
              key="unit"
              name="Структурное подразделение"
              icon={peopleIcon}
              wrap
              handleClick={editing ? undefined : viewUnit}
            >
              {user.unit?.name}
            </EditableProperty>
          </div>
        </div>
      </div>
    </section>
  );
}

function EducationSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  const higherEducation = user.education.map((edu) => (
    <div
      key={`${edu.year}/${edu.university}`}
      className="grid grid-cols-[112px,1fr]"
    >
      <div>{edu.year}</div>
      <div>
        <div>{edu.university}</div>
        <div className="font-light text-gray">{edu.major}</div>
      </div>
    </div>
  ));

  const courses = user.courses.map((course) => (
    <div
      key={`${course.year}/${course.name}`}
      className="grid grid-cols-[112px,1fr]"
    >
      <div>{course.year}</div>
      <div>
        <div>{course.name}</div>
        <FileAttachment
          filename={course.attachment || ""}
          url={course.attachment || ""}
        />
      </div>
    </div>
  ));

  return (
    <section>
      <SectionTitle title="Образование" />

      <Property icon={layoutIcon} name="Высшее образование" />
      <div className="flex flex-col ml-[5px] mt-[48px] mb-[55px] gap-[24px]">
        {higherEducation}
      </div>

      <Property icon={layersIcon} name="Курсы" />
      <div className="flex flex-col ml-[5px] mt-[48px] gap-[24px]">
        {courses}
      </div>
    </section>
  );
}

function CareerSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  const positions = user.career.map(
    ({ year_start, year_leave, position }, i) => (
      <tr key={i} className="h-[45px]">
        <td className="border border-dark-gray pl-[30px]">
          {year_start.toString() +
            (year_leave === null ? "" : ` - ${year_leave}`)}
        </td>
        <td className="border border-dark-gray pl-[30px]">{position}</td>
      </tr>
    ),
  );
  const certificates = user.training.map((t) => {
    return (
      <li key={t.name}>
        {t.name}
        {", "}
        <FileAttachment
          filename={t.attachment || ""}
          url={t.attachment || ""}
        />
      </li>
    );
  });
  return (
    <section>
      <SectionTitle title="Карьера и развитие" />
      <div className="mr-[36px] flex flex-col gap-[30px]">
        <Property
          icon={creditCardIcon}
          name="Стаж"
          value={user.workExperience || "?"}
        />

        <Property icon={externalIcon} name="Карьерный рост" />
        <table className="rounded-table w-full border border-dark-gray mb-[15px]">
          <tbody>
            <tr className="h-[45px]">
              <th className="border border-dark-gray text-dark-gray font-normal pl-[30px] text-left">
                Годы
              </th>
              <th className="border border-dark-gray text-dark-gray font-normal pl-[30px] text-left">
                Должность
              </th>
            </tr>
            {positions}
          </tbody>
        </table>

        <Property
          icon={bookIcon}
          name="Навыки и компетенции"
          value={user.skills}
        />

        {certificates.length > 0 && (
          <>
            <div className="flex items-start gap-[16px]">
              <Property icon={upArrowIcon} name="Повышение квалификации" />
              <ul className="list-disc list-inside">{certificates}</ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ViewButton(props: {
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  let style = "border border-light-blue rounded px-[38px] py-[12px] ";
  style += props.active
    ? "bg-light-blue text-white"
    : "bg-white text-light-blue";
  return (
    <button className={style} onClick={props.onClick}>
      {props.text}
    </button>
  );
}

function UserAvatarLink({ user }: { user: User }) {
  return (
    <Link to={`/profile/${user.id}`} className="shrink-0 hover:underline">
      <div className="rounded-photo overflow-hidden">
        <Picture width="210px" height="210px" url={user.photo || undefined} />
      </div>
      <div className="text-center mt-[16px]">{fullNameShort(user)}</div>
    </Link>
  );
}

function TeamSection({ user }: { user: User }) {
  const [showBosses, setShowBosses] = useState(false);

  const colleagues = useFetchColleagues(user);
  const { user: boss } = useFetchUser(user.bossId);
  if (colleagues === undefined) return;

  return (
    <section>
      <SectionTitle title="Команда" />
      <div className="flex gap-[60px]">
        <ViewButton
          active={!showBosses}
          text="Мои коллеги"
          onClick={() => setShowBosses(false)}
        />
        <ViewButton
          active={showBosses}
          text="Мой руководитель"
          onClick={() => setShowBosses(true)}
        />
      </div>
      <div className="mt-[48px] pb-[36px] flex gap-[70px] overflow-y-auto">
        {showBosses
          ? boss &&
            user.bossId !== null && (
              <UserAvatarLink key={user.bossId} user={boss} />
            )
          : [...colleagues.values()].map(
              (colleague) =>
                colleague.id !== user.id &&
                colleague.id !== user.bossId && (
                  <UserAvatarLink key={colleague.id} user={colleague} />
                ),
            )}
      </div>
    </section>
  );
}

function LinkGallery({
  links,
  width,
  height,
}: {
  links: { title: string; url: string; pictureURL: string }[];
  width: string;
  height: string;
}) {
  return (
    <div className="flex gap-[60px]">
      {links.map(({ title, url, pictureURL }) => (
        <a href={url} key={title} style={{ width }}>
          <Picture width={width} height={height} url={pictureURL} />
          <div className="mt-[35px]">{title}</div>
        </a>
      ))}
    </div>
  );
}

/*
function CommunityWorkSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  return (
    <section>
      <SectionTitle title="Общественная работа" />
      <LinkGallery width="240px" height="240px" links={{user.communityWork}} />
    </section>
  );
}
*/

function AwardsSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  return (
    <section>
      <SectionTitle title="Награды" />
      <LinkGallery
        width="270px"
        height="240px"
        links={user.awards.map((award) => ({
          title: award.title,
          pictureURL: award.image || "",
          url: "",
        }))}
      />
    </section>
  );
}

function AboutMeSection({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) {
  return (
    <section>
      <SectionTitle title="Обо мне" />
      <textarea
        disabled={!editing}
        value={user.about}
        className="w-full"
        onChange={(event) => setUser({ ...user, about: event.target.value })}
      />
    </section>
  );
}

function FeedbackSection({ userId: _ }: { userId: string }) {
  const [mark, setMark] = useState<number | undefined>(undefined);
  const [hoverMark, setHoverMark] = useState<number | undefined>(undefined);
  const onClick = (i: number) => {
    if (i === mark) setMark(undefined);
    else setMark(i);
  };
  const stars = [...Array(5)].map((_, i) => {
    const icon =
      (mark !== undefined && hoverMark === undefined && i <= mark) ||
      (hoverMark !== undefined && i <= hoverMark)
        ? starFillIcon
        : starIcon;
    return (
      <button
        key={i}
        onClick={() => onClick(i)}
        onMouseEnter={() => setHoverMark(i)}
      >
        <img style={{ width: "52px", height: "52px" }} src={icon} alt="" />
      </button>
    );
  });
  return (
    <section>
      <SectionTitle title="Обратная связь" />
      <div
        className="w-fit flex gap-[45px] cursor-pointer"
        onMouseLeave={() => setHoverMark(undefined)}
      >
        {stars}
      </div>
    </section>
  );
}

export function UserProfile() {
  const params = useParams();
  const userId = params.userId || "me";
  const { user } = useFetchUser(userId);
  const auth = useAuth();

  const [editing, setEditing] = useState(false);
  const [baseUserState, setBaseUserState] = useState<User | undefined>(
    undefined,
  );
  const [userState, setUserState] = useState<User | undefined>(undefined);

  useEffect(() => {
    setBaseUserState(user);
    setUserState(user);
  }, [user]);

  if (!user || !userState || !baseUserState) {
    return <div>Loading...</div>;
  }

  const title =
    userId == "me" || auth.userId === userId ? "Мой профиль" : user.firstName;
  console.log(auth, { userId });

  const handleSubmit: FormEventHandler = (event) => {
    console.log("submit");
    event.preventDefault();
    if (editing) {
      updateUser(auth.token, user.id, userState).catch(() =>
        setUserState(user),
      );
    }
    setBaseUserState(userState);
    setEditing(false);
  };

  const editable = userId === "me" || userId === auth.userId;

  return (
    <AnimatePage id={user.id}>
      <PageSkel title={title} heading="Основные сведения">
        <form
          spellCheck
          className={clsx("mr-[36px] ml-[64px] pb-[155px]", "relative")}
          onSubmit={handleSubmit}
        >
          {editable && (
            <div className="absolute right-0 bottom-[100%]">
              <EditControls
                editing={editing}
                edit={() => setEditing(true)}
                reset={() => {
                  setUserState(baseUserState);
                  setEditing(false);
                }}
              />
            </div>
          )}
          <ProfileCard
            user={userState}
            setUser={setUserState}
            editing={editing}
          />
          <SectionSep />
          <AboutMeSection
            user={userState}
            setUser={setUserState}
            editing={editing}
          />
          <SectionSep />
          <EducationSection userId={userId} />
          <SectionSep />
          <CareerSection userId={userId} />
          <SectionSep />
          <TeamSection user={user} />
          <SectionSep />
          {/*
        <CommunityWorkSection userId={userId} />
        <SectionSep />
        */}
          <AwardsSection userId={userId} />
          <SectionSep />
          <FeedbackSection userId={userId} />
        </form>
      </PageSkel>
    </AnimatePage>
  );
}

export default UserProfile;
