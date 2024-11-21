import {
  FormEventHandler,
  HTMLInputTypeAttribute,
  ReactNode,
  useState,
} from "react";

import clsx from "clsx/lite";

import atIcon from "/at.svg";
import awardIcon from "/award.svg";
import bookIcon from "/book.svg";
import brightnessIcon from "/brightness.svg";
import checkmarkIcon from "/checkmark.svg";
import closeIcon from "/close.svg";
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
import upArrowIcon from "/up-arrow.svg";

import { LinkWithPicture, User } from "./types";

import { useDispatch } from "react-redux";
import { useAuth } from "./auth/slice";
import FileAttachment from "./FileAttachment";
import { pageSlice } from "./page/slice";
import { useAppDispatch } from "./store";
import { updateUser, useFetchUser } from "./users/api";
import { fullNameLong, fullNameShort, MonomorphFields } from "./util";

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

function EditButton() {
  return (
    <button>
      <img style={{ width: "36px", height: "36px" }} src={editIcon} />
    </button>
  );
}

function SectionTitle({
  title,
  editable = true,
}: {
  title: string;
  editable?: boolean;
}) {
  return (
    <div className="mb-[40px] flex justify-between">
      <h2 className="font-medium text-[30px]">{title}</h2>
      {editable && <EditButton />}
    </div>
  );
}

function Picture({
  url,
  width,
  height,
  alt = "",
}: {
  url: string;
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

function EditableProperty({
  icon,
  name,
  handleClick,
  children,
}: {
  icon: string;
  name: string;
  handleClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center">
      <img
        style={{ width: "30px", height: "30px" }}
        src={icon}
        alt=""
        className="inline-block mr-[20px]"
      />
      <span
        className={clsx(
          "border-b-[1px] border-blue border-opacity-0 shrink-0 mr-[10px] text-dark-gray",
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
  handleChange,
}: {
  type?: HTMLInputTypeAttribute;
  editing: boolean;
  pattern?: string;
  value: string;
  handleChange: (value: string) => void;
}) {
  return (
    <input
      type={type}
      pattern={pattern}
      className={clsx(
        "min-w-0 py-1 border-b-[1px]",
        "outline-none border-opacity-0 border-blue",
        "valid:border-excel invalid:border-[#f00]",
        editing && "border-opacity-100",
      )}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={!editing}
    />
  );
}

export function ProfileCard({
  user,
  editable = false,
}: {
  user: User;
  editable?: boolean;
}) {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const [editing, setEditing] = useState(false);
  const [userState, setUserState] = useState(user);

  const changeField =
    (key: MonomorphFields<User, string>) => (value: string) => {
      setUserState({ ...userState, [key]: value });
    };

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    if (editing) {
      updateUser(auth.token, user.username, userState).catch(() =>
        setUserState(user),
      );
    }
    setEditing(false);
  };

  const viewProfile = () => {
    dispatch(pageSlice.actions.viewProfile({ userId: user.id }));
  };

  const viewUnit = () => {
    console.log("view unit");
    dispatch(pageSlice.actions.viewOrgStruct({ unitId: user.structuralUnit }));
  };

  const field = ({
    name,
    icon,
    field,
    canEdit = true,
    type = "text",
    pattern,
    handleClick,
  }: {
    name: string;
    icon: string;
    field: MonomorphFields<User, string>;
    canEdit?: boolean;
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
        editing={canEdit && editing}
        value={userState[field]}
        handleChange={changeField(field)}
      />
    </EditableProperty>
  );

  return (
    <section className="-ml-[20px] flex gap-[64px] h-[340px]">
      <button
        type="button"
        className="shrink-0 rounded-photo overflow-hidden"
        onClick={viewProfile}
      >
        <Picture width="260px" height="100%" url={user.photoURL} />
      </button>
      <form
        spellCheck
        className="w-full flex flex-col justify-between"
        onSubmit={handleSubmit}
      >
        <div className="flex">
          <img src={personIcon} alt="" className="w-[33px]" />
          <button
            type="button"
            className="ml-[28px] text-[30px] hover:underline"
            onClick={viewProfile}
          >
            <h2>{fullNameLong(user)}</h2>
          </button>
          <div className="grow"></div>
          {editing ? (
            <>
              <button type="submit">
                <img
                  style={{ width: "36px", height: "36px" }}
                  src={checkmarkIcon}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setUserState(user);
                }}
              >
                <img
                  style={{ width: "36px", height: "36px" }}
                  src={closeIcon}
                />
              </button>
            </>
          ) : (
            editable && (
              <button type="button" onClick={() => setEditing(true)}>
                <img style={{ width: "36px", height: "36px" }} src={editIcon} />
              </button>
            )
          )}
        </div>
        <div className="grow"></div>
        <div className="grid grid-flow-col grid-rows-[repeat(5,58px)] grid-cols-2 items-center">
          {[
            <div key="territorialBody" className="col-span-2">
              {field({
                field: "territorialBody",
                name: "Тер. орган",
                icon: pinIcon,
                canEdit: false,
              })}
            </div>,
            <div key="structuralUnit" className="col-span-2">
              {field({
                field: "structuralUnit",
                name: "Подразделение",
                icon: peopleIcon,
                canEdit: false,
                handleClick: editing ? undefined : viewUnit,
              })}
            </div>,
            field({
              field: "status",
              name: "Статус",
              icon: brightnessIcon,
            }),
            field({
              field: "dateOfBirth",
              name: "Дата рождения",
              icon: giftIcon,
              type: "date",
            }),
            field({
              field: "phone",
              name: "Телефон",
              icon: phoneIcon,
              type: "tel",
              pattern: "\\+7[0-9]{10}",
            }),
            field({
              field: "email",
              name: "Почта",
              icon: atIcon,
              type: "email",
            }),
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
        </div>
      </form>
    </section>
  );
}

function EducationSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  const higherEducation = user.higherEducation.map((edu) => (
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
          filename={course.certificate}
          url={course.certificateURL}
        />
      </div>
    </div>
  ));

  return (
    <section>
      <SectionTitle title="Образование" />

      {higherEducation.length > 0 && (
        <>
          <Property icon={layoutIcon} name="Высшее образование" />
          <div className="flex flex-col ml-[5px] mt-[48px] mb-[55px] gap-[24px]">
            {higherEducation}
          </div>
        </>
      )}

      {courses.length > 0 && (
        <>
          <Property icon={layersIcon} name="Курсы" />
          <div className="flex flex-col ml-[5px] mt-[48px] gap-[24px]">
            {courses}
          </div>
        </>
      )}
    </section>
  );
}

function CareerSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  const positions = user.career.map(({ period, position }) => (
    <tr key={period} className="h-[45px]">
      <td className="border border-dark-gray pl-[30px]">{period}</td>
      <td className="border border-dark-gray pl-[30px]">{position}</td>
    </tr>
  ));
  const certificates = user.professionalDevelopments.map((dev) => {
    return (
      <li key={dev.name}>
        {dev.name}
        {", "}
        <FileAttachment filename={dev.certificate} url={dev.certificateURL} />
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
          value={user.workExperience}
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

function UserAvatarLink({ userId }: { userId: string }) {
  const dispatch = useDispatch();
  const { user } = useFetchUser(userId);
  if (!user) return;
  return (
    <button
      className="shrink-0 hover:underline"
      onClick={() => {
        dispatch(pageSlice.actions.viewProfile({ userId }));
      }}
    >
      <div className="rounded-photo overflow-hidden">
        <Picture width="210px" height="210px" url={user.photoURL} />
      </div>
      <div className="text-center mt-[16px]">{fullNameShort(user)}</div>
    </button>
  );
}

function TeamSection({ userId }: { userId: string }) {
  const [showBosses, setShowBosses] = useState(false);
  const { user } = useFetchUser(userId);
  if (!user) return;

  const data = showBosses ? user.bosses : user.colleagues;
  return (
    <section>
      <SectionTitle title="Команда" />
      <div className="flex gap-[60px]">
        <ViewButton
          active={!showBosses}
          text="Мой отдел"
          onClick={() => setShowBosses(false)}
        />
        <ViewButton
          active={showBosses}
          text="Мои руководители"
          onClick={() => setShowBosses(true)}
        />
      </div>
      <div className="mt-[48px] pb-[36px] flex gap-[70px] overflow-y-auto">
        {data.map(
          (colleagueId) =>
            colleagueId !== userId && (
              <UserAvatarLink key={colleagueId} userId={colleagueId} />
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
  links: LinkWithPicture[];
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

function CommunityWorkSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  return (
    <section>
      <SectionTitle title="Общественная работа" />
      <LinkGallery width="240px" height="240px" links={user.communityWork} />
    </section>
  );
}

function AwardsSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  return (
    <section>
      <SectionTitle title="Награды" />
      <LinkGallery width="270px" height="240px" links={user.awards} />
    </section>
  );
}

function AboutMeSection({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  if (!user) return;

  return (
    <section>
      <SectionTitle title="Обо мне" />
      <p>{user.about}</p>
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
    const bg =
      ((mark !== undefined && hoverMark === undefined && i <= mark) ||
        (hoverMark !== undefined && i <= hoverMark)) &&
      "bg-light-blue";
    return (
      <button
        key={i}
        onClick={() => onClick(i)}
        onMouseEnter={() => setHoverMark(i)}
      >
        <img
          style={{ width: "52px", height: "52px" }}
          src={starIcon}
          alt=""
          className={clsx(bg)}
        />
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

export default function UserProfile({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  const auth = useAuth();

  return (
    <div className="mr-[36px] ml-[64px] pb-[155px]">
      {user !== null && (
        <>
          <ProfileCard user={user} editable={user.id == auth.userId} />
          <SectionSep />
        </>
      )}
      <AboutMeSection userId={userId} />
      <SectionSep />
      <EducationSection userId={userId} />
      <SectionSep />
      <CareerSection userId={userId} />
      <SectionSep />
      <TeamSection userId={userId} />
      <SectionSep />
      <CommunityWorkSection userId={userId} />
      <SectionSep />
      <AwardsSection userId={userId} />
      <SectionSep />
      <FeedbackSection userId={userId} />
    </div>
  );
}
