import {
  FormEventHandler,
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import clsx from "clsx/lite";
import { produce } from "immer";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ACCEPT_DOCUMENTS, ACCEPT_IMAGES } from "@/app/const";

import { tokenFetch, useAuth } from "@/auth/slice";
import {
  fullImagePath,
  fullNameShort,
  trimExtention,
  userPhotoPath,
} from "@/common/util";
import { saveUser, useFetchColleagues, useFetchUser } from "./api";
import { UpdateUserFn, User, userBlobURLs } from "./types";

import { AnimatePage, PageSkel } from "@/app/Page";
import { Attachment } from "@/common/Attachment";
import { SlideButton } from "@/common/SlideButton";

import { Icon } from "@/common/Icon";
import { Picture } from "@/common/Picture";
import { EditableProperty, FileInput, PropertyInput } from "./common";
import { ProfileCard } from "./ProfileCard";
import bookIcon from "/book.svg";
import creditCardIcon from "/credit-card.svg";
import crossIcon from "/cross.svg";
import editIcon from "/edit.svg";
import externalIcon from "/external.svg";
import layersIcon from "/layers.svg";
import layoutIcon from "/layout.svg";
import starYellowIcon from "/star-yellow.svg";
import starIcon from "/star.svg";
import upArrowIcon from "/up-arrow.svg";

const SectionSep = () => {
  return (
    <hr
      className={clsx(
        "border-[1px] border-medium-gray",
        "mt-[64px] -mr-[10px] mb-[36px] -ml-[36px]",
      )}
    />
  );
};

const Property = ({
  icon,
  name,
  value,
}: {
  icon: string;
  name: string;
  value?: string;
}) => {
  return (
    <div>
      <Icon
        src={icon}
        width="30px"
        height="30px"
        className="inline-block mr-[20px]"
      />
      <span className="mr-[10px] text-dark-gray">{name}:</span>
      {value}
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => {
  return <h2 className="mb-[40px] font-medium text-[30px]">{title}</h2>;
};

const EditControls = ({
  editing,
  edit,
  reset,
}: {
  editing: boolean;
  edit: () => void;
  reset: () => void;
}) => {
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
      <Icon src={editIcon} width="36px" height="36px" />
    </button>
  );
};

const RowControls = ({ controls }: { controls: [string, () => void][] }) => {
  return (
    <div className="flex text-dark-gray gap-6 ml-4">
      {controls.map(([name, handle]) => (
        <button className="hover:underline" type="button" onClick={handle}>
          {name}
        </button>
      ))}
    </div>
  );
};

const Timeline = ({
  controlsAbove,
  controlsBelow,
  editing,
  children,
}: {
  controlsAbove?: [string, () => void][];
  controlsBelow?: [string, () => void][];
  editing: boolean;
  children?: ReactNode;
}) => {
  return (
    <div
      className={clsx(
        "grid gap-x-[42px] gap-y-4",
        editing ? "grid-cols-[140px,auto]" : "grid-cols-[70px,auto]",
      )}
    >
      {editing && controlsAbove && (
        <>
          <div></div>
          <RowControls controls={controlsAbove} />
        </>
      )}
      {children}
      {editing && controlsBelow && (
        <>
          <div></div>
          <RowControls controls={controlsBelow} />
        </>
      )}
    </div>
  );
};

const HigherEducationInfo = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
}) => {
  const unshiftItem = () =>
    updateUser(({ education }) => {
      let year = new Date().getFullYear();
      if (education[0] && education[0].year < year) {
        year = education[0].year + 1;
      }
      education.unshift({
        year,
        university: "",
        major: "",
      });
    });

  const shiftItem = () => updateUser((user) => user.education.shift());

  const pushItem = () =>
    updateUser(({ education }) =>
      education.push({
        year: education[education.length - 1]
          ? education[education.length - 1].year - 1
          : new Date().getFullYear(),
        university: "",
        major: "",
      }),
    );

  const popItem = () => updateUser((user) => user.education.pop());

  const changeYear = (i: number) => (value: string) => {
    const year = Number(value);
    if (Number.isNaN(year)) return;
    updateUser((user) => (user.education[i].year = year));
  };

  const changeAttr =
    (i: number, attr: "university" | "major") => (value: string) =>
      updateUser((user) => (user.education[i][attr] = value));

  const items = user.education.map((edu, i) => (
    <>
      <PropertyInput
        type="number"
        editing={editing}
        value={edu.year.toString()}
        theme="h-fit text-center px-6 py-[6px]"
        handleChange={changeYear(i)}
      />
      {editing ? (
        <div className="flex flex-col gap-2">
          <PropertyInput
            required
            editing={editing}
            value={edu.university}
            placeholder="Название университета"
            theme="px-[20px] py-[6px]"
            handleChange={changeAttr(i, "university")}
          />
          <PropertyInput
            required
            editing={editing}
            value={edu.major}
            pattern=".+"
            placeholder="Название факультета"
            theme="px-[20px] py-[3px] font-light text-gray"
            handleChange={changeAttr(i, "major")}
          />
        </div>
      ) : (
        <div>
          <div>{edu.university}</div>
          <div className="font-light text-gray">{edu.major}</div>
        </div>
      )}
    </>
  ));

  return (
    <>
      <Property icon={layoutIcon} name="Высшее образование" />
      <div className={clsx(editing ? "my-6" : "my-12")}>
        <Timeline
          editing={editing}
          controlsAbove={[
            ["+ Добавить", unshiftItem],
            ["- Удалить", shiftItem],
          ]}
          controlsBelow={
            user.education.length === 0
              ? undefined
              : [
                  ["+ Добавить", pushItem],
                  ["- Удалить", popItem],
                ]
          }
        >
          {items}
        </Timeline>
      </div>
    </>
  );
};

const EducationSection = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
}) => {
  const unshiftCourse = () =>
    updateUser(({ courses }) =>
      courses.unshift({
        year: courses[0]?.year ?? new Date().getFullYear(),
        name: "",
        attachment: null,
      }),
    );

  const shiftCourse = () => updateUser(({ courses }) => courses.shift());

  const pushCourse = () =>
    updateUser(({ courses }) =>
      courses.push({
        year: courses[courses.length - 1]?.year ?? new Date().getFullYear(),
        name: "",
        attachment: null,
      }),
    );

  const popCourse = () => updateUser(({ courses }) => courses.pop());

  const changeFile = (i: number, url: string | null) => {
    console.log("update user set file", url);
    updateUser((user) => (user.courses[i].attachment = url));
  };

  const courses = (
    <Timeline
      editing={editing}
      controlsAbove={[
        ["+ Добавить", unshiftCourse],
        ["- Удалить", shiftCourse],
      ]}
      controlsBelow={
        user.courses.length === 0
          ? undefined
          : [
              ["+ Добавить", pushCourse],
              ["- Удалить", popCourse],
            ]
      }
    >
      {user.courses.map(({ year, name, attachment }, i) => (
        <>
          <PropertyInput
            type="number"
            editing={editing}
            value={year.toString()}
            theme="h-fit text-center px-6 py-[6px]"
            handleChange={(value) => {
              const year = Number(value);
              if (Number.isNaN(year)) return;
              updateUser((user) => (user.courses[i].year = year));
            }}
          />
          {editing ? (
            <div className="flex flex-col gap-2">
              <PropertyInput
                required
                editing={editing}
                value={name}
                placeholder="Название курса"
                theme="px-[20px] py-[6px]"
                handleChange={(value) =>
                  updateUser((user) => (user.courses[i].name = value))
                }
              />
              {attachment ? (
                <div className="flex">
                  <Attachment url={attachment || ""} />
                  <button
                    className="hover:underline text-dark-gray ml-4 text-[20px]"
                    onClick={() => changeFile(i, null)}
                  >
                    (Удалить файл)
                  </button>
                </div>
              ) : (
                <label className="hover:underline cursor-pointer text-dark-gray ml-4 text-[20px]">
                  <FileInput
                    accept={ACCEPT_DOCUMENTS}
                    onUpload={(url) => changeFile(i, url)}
                  />
                  + Загрузить файл
                </label>
              )}
            </div>
          ) : (
            <div>
              <div>{name}</div>
              <Attachment url={attachment || ""} />
            </div>
          )}
        </>
      ))}
    </Timeline>
  );

  return (
    <section>
      <SectionTitle title="Образование" />

      <HigherEducationInfo
        user={user}
        updateUser={updateUser}
        editing={editing}
      />

      <Property icon={layersIcon} name="Курсы" />
      <div className={clsx(editing ? "my-6" : "my-12")}>{courses}</div>
    </section>
  );
};

const TrainingInfo = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
}) => {
  const changeName = (i: number, value: string) =>
    updateUser((user) => (user.training[i].name = value));

  const changeFile = (i: number, url: string) =>
    updateUser((user) => (user.training[i].attachment = url));

  const pushItem = () =>
    updateUser((user) => user.training.push({ name: "", attachment: null }));

  const popItem = () => updateUser((user) => user.training.pop());

  const removeFile = (i: number) =>
    updateUser((user) => (user.training[i].attachment = null));

  const certificates = user.training.map(({ name, attachment }, i) => {
    return (
      <li key={i}>
        {editing ? (
          <input
            required
            value={name}
            onChange={({ target: { value } }) => changeName(i, value)}
            className="w-full mb-1 px-[20px] py-[6px] border rounded"
          />
        ) : (
          <span>{name}</span>
        )}
        {editing ? (
          attachment ? (
            <div className="">
              <Attachment url={attachment} />
              <button
                type="button"
                className="ml-4 hover:underline text-dark-gray text-[20px]"
                onClick={() => removeFile(i)}
              >
                (Удалить файл)
              </button>
            </div>
          ) : (
            <label className="ml-4 block hover:underline text-dark-gray text-[20px] cursor-pointer">
              <FileInput
                accept={ACCEPT_DOCUMENTS}
                onUpload={(url) => changeFile(i, url)}
              />
              + Загрузить файл
            </label>
          )
        ) : (
          attachment && (
            <>
              {", "}
              <Attachment url={attachment} />
            </>
          )
        )}
      </li>
    );
  });

  return (
    <div>
      <Property icon={upArrowIcon} name="Повышение квалификации" />
      <div className="w-1/2 ml-8 mt-2">
        <ul className="mb-4 list-disc flex flex-col gap-4">{certificates}</ul>
        {editing && (
          <RowControls
            controls={[
              ["+ Добавить", pushItem],
              ["- Удалить", popItem],
            ]}
          ></RowControls>
        )}
      </div>
    </div>
  );
};

const CareerPositionsTableControls = ({
  editing,
  add,
  remove,
  isLastRow = false,
}: {
  editing: boolean;
  add: () => void;
  remove: () => void;
  isLastRow?: boolean;
}) => {
  if (!editing) {
    return;
  }
  return (
    <div
      className={clsx(
        "col-span-3 flex text-dark-gray border-x border-b",
        isLastRow && "rounded-b",
      )}
    >
      <button
        type="button"
        className="grow basis-0 hover:underline border-r py-2"
        onClick={add}
      >
        + Добавить
      </button>
      <button
        type="button"
        className="grow basis-0 hover:underline py-2"
        onClick={remove}
      >
        - Удалить
      </button>
    </div>
  );
};

const CareerPositionsTable = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
}) => {
  const headerClass = clsx(
    "border-t border-r border-b border-dark-gray",
    "px-6 py-2",
    "text-dark-gray",
  );

  const cellClass = clsx("border-b border-r border-dark-gray", "px-6 py-2");

  const inputCellClass = clsx(cellClass, "w-full outline-none bg-white");

  const changeStartYear = (i: number, value: string) =>
    updateUser((user) => {
      const year_start = Number(value);
      if (!Number.isNaN(year_start)) {
        user.career[i].year_start = year_start;
      }
    });

  const changeLeaveYear = (i: number, value: string) =>
    updateUser((user) => {
      const year_leave = Number(
        user.career[i].year_leave === null
          ? value.replace(/[^0-9]/g, "")
          : value,
      );
      if (Number.isNaN(year_leave)) {
        user.career[i].year_leave = null;
      } else {
        user.career[i].year_leave = year_leave;
      }
    });

  const unshiftPosition = () =>
    updateUser((user) => {
      const y = new Date().getFullYear();
      const c = user.career[0];
      const year_start = c?.year_leave ?? y;
      const year_leave = c && c.year_leave !== null ? c.year_leave + 1 : null;
      c.year_leave = year_start;
      user.career.unshift({
        year_start,
        year_leave,
        month_start: null,
        month_leave: null,
        position: "",
      });
    });

  const shiftPosition = () => updateUser((user) => user.career.shift());

  const pushPosition = () =>
    updateUser((user) => {
      if (user.career.length === 0) {
        return;
      }
      const year_leave = user.career[user.career.length - 1].year_start;
      const year_start = year_leave - 1;
      user.career.push({
        year_start,
        year_leave,
        month_start: null,
        month_leave: null,
        position: "",
      });
    });

  const popPosition = () => updateUser((user) => user.career.pop());

  return (
    <div className="grid w-full grid-cols-[auto,auto,80%] mb-[15px]">
      {/* Header */}
      <div
        className={clsx(
          headerClass,
          "rounded-tl border-l",
          "text-center",
          "col-span-2",
        )}
      >
        Годы
      </div>
      <div className={clsx(headerClass, "rounded-tr")}>Должность</div>

      <CareerPositionsTableControls
        editing={editing}
        add={unshiftPosition}
        remove={shiftPosition}
      />

      {user.career.map(({ year_start, year_leave, position }, i) => (
        <Fragment key={i}>
          {/* Position row */}
          <input
            required
            disabled={!editing}
            className={clsx(inputCellClass, "text-center", "border-l")}
            value={year_start.toString()}
            onChange={({ target: { value } }) => changeStartYear(i, value)}
          />
          <input
            required
            disabled={!editing}
            className={clsx(inputCellClass, "text-center")}
            value={year_leave?.toString() || "н. вр."}
            onChange={({ target: { value } }) => changeLeaveYear(i, value)}
          />
          <input
            required
            disabled={!editing}
            className={clsx(inputCellClass)}
            value={position}
            onChange={({ target: { value } }) =>
              updateUser((user) => (user.career[i].position = value))
            }
          />
        </Fragment>
      ))}

      <CareerPositionsTableControls
        isLastRow
        editing={editing}
        add={pushPosition}
        remove={popPosition}
      />
    </div>
  );
};

const CareerSection = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
}) => {
  return (
    <section>
      <SectionTitle title="Карьера и развитие" />
      <div className="mr-[36px] flex flex-col gap-[30px]">
        <EditableProperty icon={creditCardIcon} name="Стаж">
          <div className="w-[136px]">
            <PropertyInput
              editing={editing}
              value={user.workExperience || ""}
              theme="px-6 py-[6px] text-center"
              handleChange={(value) =>
                updateUser((user) => (user.workExperience = value))
              }
            />
          </div>
        </EditableProperty>

        <Property icon={externalIcon} name="Карьерный рост" />
        <CareerPositionsTable
          user={user}
          updateUser={updateUser}
          editing={editing}
        />

        <EditableProperty wrap icon={bookIcon} name="Навыки и компетенции">
          {editing ? (
            <textarea
              className={clsx("w-full mt-2 px-5 py-2", "rounded border")}
              value={user.skills}
              onChange={({ target: { value } }) =>
                updateUser({ ...user, skills: value })
              }
            />
          ) : (
            <span>{user.skills}</span>
          )}
        </EditableProperty>

        <TrainingInfo user={user} updateUser={updateUser} editing={editing} />
      </div>
    </section>
  );
};

const ViewButton = ({
  text,
  active,
  onClick,
}: {
  text: string;
  active: boolean;
  onClick: () => void;
}) => {
  let style = "border border-light-blue rounded px-[38px] py-[12px] ";
  style += active ? "bg-light-blue text-white" : "bg-white text-light-blue";
  return (
    <button type="button" className={style} onClick={onClick}>
      {text}
    </button>
  );
};

const UserAvatarLink = ({ user }: { user: User }) => {
  return (
    <Link to={`/profile/${user.id}`} className="shrink-0 w-fit hover:underline">
      <div className="rounded-photo overflow-hidden">
        <Picture width="210px" height="210px" url={userPhotoPath(user)} />
      </div>
      <div className="text-center mt-[16px]">{fullNameShort(user)}</div>
    </Link>
  );
};

const TeamSection = ({ user }: { user: User }) => {
  const [showBosses, setShowBosses] = useState(false);

  const colleagues = useFetchColleagues(user);
  const { user: boss } = useFetchUser(user.bossId);

  let users: User[] = [];
  if (showBosses && boss && user.bossId !== null) {
    users = [boss];
  } else if (!showBosses) {
    users = [...(colleagues?.values() || [])].flatMap((colleague) =>
      colleague.id !== user.id && colleague.id !== user.bossId
        ? [colleague]
        : [],
    );
  }

  const items = users.map((user) => (
    <UserAvatarLink key={user.id} user={user} />
  ));

  return (
    <section className="mr-8">
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
      <div className="mt-[48px] pb-[36px]">
        <Slides window={5} gap={10} items={items} />
      </div>
    </section>
  );
};

const Slides = ({
  window,
  gap,
  items,
}: {
  window: number;
  gap: number | string;
  items: ReactNode[];
}) => {
  const [idx, setIdx] = useState(0);

  let i = idx;
  if (i >= items.length) i = items.length - 1;
  if (i < 0) i = 0;

  return (
    <div className="relative">
      <div className="w-[60px] absolute right-full top-0 h-full flex items-center">
        <SlideButton
          direction="left"
          hide={i <= 0 || items.length === 0}
          onClick={() => setIdx(i - 1)}
        />
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${window}, 1fr)`,
          gridColumnGap: gap,
        }}
      >
        {items.slice(i, i + window).map((item) => (
          <div className="shrink-0 w-fit">{item}</div>
        ))}
      </div>
      <div className="w-[60px] absolute left-full top-0 h-full flex items-center">
        <SlideButton
          direction="right"
          hide={i + window >= items.length}
          onClick={() => setIdx(i + 1)}
        />
      </div>
    </div>
  );
};

const GallerySection = ({
  user,
  updateUser,
  editing,
  attr,
  window,
  title,
  height,
  gap,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
  attr: "awards" | "communityWork";
  window: number;
  title: string;
  height: string | number;
  gap: string | number;
}) => {
  const pushItem = () =>
    updateUser((user) => user[attr].push({ name: "", attachment: null }));

  const deleteItem = (i: number) =>
    updateUser((user) => user[attr].splice(i, 1));

  const changeTitle = (i: number, value: string) =>
    updateUser((user) => (user[attr][i].name = value));

  const changeImg = (i: number, url: string) =>
    updateUser((user) => (user[attr][i].attachment = url));

  const items = user[attr].map(({ name: title, attachment }, i) => (
    <div key={i} className="relative">
      {editing && (
        <button
          type="button"
          onClick={() => deleteItem(i)}
          style={{ width: 24, height: 24, translate: "-25% 0" }}
          className="absolute left-[100%] bottom-[100%]"
        >
          <Icon src={crossIcon} />
        </button>
      )}
      {attachment && (
        <Icon
          src={fullImagePath(attachment)}
          height={height}
          className="w-full object-cover object-center"
        />
      )}
      {editing ? (
        <>
          {!attachment && (
            <label
              style={{ height }}
              className={clsx(
                "flex items-center",
                "cursor-pointer",
                "rounded border",
              )}
            >
              <FileInput
                accept={ACCEPT_IMAGES}
                onUpload={(url) => changeImg(i, url)}
              />
              <div className="w-full text-center">Загрузить картинку</div>
            </label>
          )}
          <textarea
            required
            value={title}
            className="mt-8 w-full px-3 py-2 rounded border resize-none"
            onChange={({ target: { value } }) => changeTitle(i, value)}
          />
        </>
      ) : (
        <div className="mt-8">{title}</div>
      )}
    </div>
  ));

  if (editing) {
    items.push(
      <div>
        <button
          key="add"
          type="button"
          onClick={pushItem}
          style={{ height }}
          className="w-full flex items-center justify-center bg-[#e9e9e9]"
        >
          <div className="text-[24px]">+ Добавить</div>
        </button>
        <textarea
          disabled
          className={clsx(
            "mt-8 w-full px-3 py-2 resize-none bg-white",
            "border border-[#00000000]",
          )}
        />
      </div>,
    );
  }

  return (
    <section className="mr-8">
      <SectionTitle title={title} />
      <Slides window={window} gap={gap} items={items} />
    </section>
  );
};

const AwardsSection = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
}) => (
  <GallerySection
    attr="awards"
    title="Награды"
    window={4}
    height={240}
    gap={40}
    user={user}
    updateUser={updateUser}
    editing={editing}
  />
);

const CommunityWorkSection = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
}) => (
  <GallerySection
    attr="communityWork"
    title="Общественная работа"
    window={5}
    height={200}
    gap={30}
    user={user}
    updateUser={updateUser}
    editing={editing}
  />
);

const AboutMeSection = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
  editing: boolean;
}) => {
  return (
    <section>
      <SectionTitle title="Обо мне" />
      {editing ? (
        <textarea
          value={user.about}
          className="w-full p-[22px] h-48 rounded border"
          onChange={({ target: { value } }) =>
            updateUser({ ...user, about: value })
          }
        />
      ) : (
        <div>
          {user.about.split("\n").map((para) => (
            <p>{para}</p>
          ))}
        </div>
      )}
    </section>
  );
};

const FeedbackSection = ({ user }: { user: User }) => {
  const auth = useAuth();
  const [mark, setMark] = useState<number | undefined>(undefined);
  const [hoverMark, setHoverMark] = useState<number | undefined>(undefined);

  if (!auth) return;

  const onClick = (i: number) => {
    if (i === mark) {
      setMark(undefined);
      return;
    }
    setMark(i);
    tokenFetch(auth.token, `/colleagues/${user.id}/rate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rate: 1 + i,
        employee: user.id,
        user: auth.userId,
      }),
    });
  };

  const stars = [...Array(5)].map((_, i) => {
    const icon =
      (mark !== undefined && hoverMark === undefined && i <= mark) ||
      (hoverMark !== undefined && i <= hoverMark)
        ? starYellowIcon
        : starIcon;
    return (
      <button
        type="button"
        key={i}
        onClick={() => onClick(i)}
        onMouseEnter={() => setHoverMark(i)}
      >
        <Icon src={icon} width="52px" height="52px" />
      </button>
    );
  });

  const rating = user.avgRating?.toFixed(1)?.replace(".", ",");

  return (
    <section>
      <SectionTitle title="Обратная связь" />
      <div className="flex gap-12 items-center">
        <div
          className="w-fit flex gap-[45px] cursor-pointer"
          onMouseLeave={() => setHoverMark(undefined)}
        >
          {stars}
        </div>
        <div className="text-[36px]">{rating}</div>
      </div>
    </section>
  );
};

const revokeUnusedURLs = (oldUser: User, user: User) => {
  const s1 = userBlobURLs(oldUser);
  const s2 = userBlobURLs(user);
  for (const url of s1) {
    if (s2.has(url)) {
      continue;
    }
    URL.revokeObjectURL(trimExtention(url));
  }
};

export const UserProfile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const auth = useAuth();
  const userId = params.userId || auth.userId;
  const { user } = useFetchUser(userId);

  if (!params.userId) {
    navigate(`/profile/${userId}`);
  }

  const [editing, setEditing] = useState(false);
  const [userState, setUserState] = useState<User | undefined>(undefined);

  const updateUserState = useMemo<UpdateUserFn>(
    () => (recipe) => {
      if (typeof recipe !== "function") {
        setUserState((user) => {
          if (user) {
            revokeUnusedURLs(user, recipe);
          }
          return recipe;
        });
        return;
      }
      setUserState((user) => {
        if (!user) {
          return;
        }
        return produce(user, (draft) => {
          recipe(draft);
          revokeUnusedURLs(user, draft);
        });
      });
    },
    [setUserState],
  );

  useEffect(() => {
    if (user) {
      updateUserState(user);
    }
    // FIXME:
    // setEditing(false);
  }, [updateUserState, user]);

  if (!user || !userState) {
    return;
  }

  const title =
    userId == "me" || auth.userId === userId ? "Мой профиль" : user.firstName;

  const handleSubmit: FormEventHandler = (event) => {
    console.log("submit");
    event.preventDefault();
    if (editing) {
      saveUser(auth.token, userState).catch(() => setUserState(user));
    }
    setEditing(false);
  };

  const editable = userId === "me" || userId === auth.userId;

  const sections = [
    ProfileCard,
    AboutMeSection,
    EducationSection,
    CareerSection,
    TeamSection,
    AwardsSection,
    CommunityWorkSection,
  ];

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
                  setUserState(user);
                  setEditing(false);
                }}
              />
            </div>
          )}
          {sections.map((Section, i) => (
            <>
              <Section
                key={i}
                user={userState}
                updateUser={updateUserState}
                editing={editing}
              />
              <SectionSep key={`sep-${i}`} />
            </>
          ))}
          <FeedbackSection user={user} />
        </form>
      </PageSkel>
    </AnimatePage>
  );
};
