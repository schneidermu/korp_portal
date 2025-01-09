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
import starYellowIcon from "/star-yellow.svg";
import upArrowIcon from "/up-arrow.svg";
import crossIcon from "/cross.svg";

import { User, USER_STATUS, UserStatus } from "./types";

import { tokenFetch, useAuth } from "./auth/slice";
import FileAttachment from "./FileAttachment";
import { updateUser, useFetchColleagues, useFetchUser } from "./users/api";
import {
  fileExtention,
  formatDateOfBirth,
  fullImagePath,
  fullNameLong,
  fullNameShort,
  MonomorphFields,
  userPhotoPath,
} from "./util";
import { AnimatePage, PageSkel } from "./Page.tsx";
import { Link, useNavigate, useParams } from "react-router-dom";
import { produce, WritableDraft } from "immer";
import SlideButton from "./SlideButton.tsx";

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
  theme,
  placeholder,
  required,
  handleChange,
}: {
  type?: HTMLInputTypeAttribute;
  editing: boolean;
  pattern?: string;
  value: string;
  text?: string;
  theme?: string;
  placeholder?: string;
  required?: boolean;
  handleChange: (value: string) => void;
}) {
  return editing ? (
    <input
      type={type}
      pattern={pattern}
      placeholder={placeholder}
      required={required}
      className={clsx(
        "w-full",
        "border rounded border-black",
        "invalid:border-[#f00]",
        theme,
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
        "border rounded bg-white border-black",
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

const Avatar = ({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) => {
  return (
    <Link
      to={`/profile/${user.id}`}
      className="shrink-0 rounded-photo overflow-hidden relative"
    >
      <Picture width="260px" height="100%" url={userPhotoPath(user)} />
      {editing && (
        <div className="w-full absolute bottom-0 text-[16px] bg-[#D9D9D9C0]">
          <label
            className="block w-full py-3 hover:underline text-center cursor-pointer"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              type="file"
              name="avatar"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={({ target: { files } }) => {
                if (!files || files.length < 1) {
                  return;
                }
                if (user.photo?.startsWith("blob")) {
                  URL.revokeObjectURL(user.photo);
                  console.log("revoke", user.photo);
                }
                const file = files[0];
                const url = URL.createObjectURL(file);
                console.log("set photo", url);
                setUser({ ...user, photo: url });
              }}
              onClick={(event) => event.stopPropagation()}
            />
            Загрузить фото
          </label>
          <hr className="text-[#cecece]" />
          <button
            onClick={(event) => {
              event.stopPropagation();
              setUser({ ...user, photo: null });
            }}
            className="w-full py-3 hover:underline"
            type="button"
          >
            Удалить фото
          </button>
        </div>
      )}
    </Link>
  );
};

export function ProfileCard({
  user,
  setUser = () => ({}),
  editing = false,
}: {
  user: User;
  setUser?: (user: User) => void;
  editing?: boolean;
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
        theme="py-[6px] px-[10px]"
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
      <Avatar editing={editing} user={user} setUser={setUser} />
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
  controls,
  editing,
  children,
}: {
  controls: [string, () => void][];
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
      {children}
      {editing && (
        <>
          <div></div>
          <RowControls controls={controls} />
        </>
      )}
    </div>
  );
};

const HigherEducationInfo = ({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) => {
  const pushItem = () =>
    setUser(
      produce((user) => {
        user.education.push({
          year: new Date().getFullYear(),
          university: "",
          major: "",
        });
      }, user)(),
    );

  const popItem = () =>
    setUser(
      produce((user: WritableDraft<User>) => {
        user.education.pop();
      }, user)(),
    );

  const changeYear = (i: number) => (value: string) => {
    const year = Number(value);
    if (Number.isNaN(year)) return;
    setUser(
      produce((user) => {
        user.education[i].year = year;
      }, user)(),
    );
  };

  const changeAttr =
    (i: number, attr: "university" | "major") => (value: string) =>
      setUser(
        produce((user) => {
          user.education[i][attr] = value;
        }, user)(),
      );

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
          controls={[
            ["+ Добавить", pushItem],
            ["- Удалить", popItem],
          ]}
        >
          {items}
        </Timeline>
      </div>
    </>
  );
};

function EducationSection({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) {
  const courses = (
    <Timeline
      editing={editing}
      controls={[
        [
          "+ Добавить",
          () =>
            setUser(
              produce((user) => {
                user.courses.push({
                  year: new Date().getFullYear(),
                  name: "",
                  attachment: null,
                });
              }, user)(),
            ),
        ],
        [
          "- Удалить",
          () =>
            setUser(
              produce((user: WritableDraft<User>) => {
                user.courses.pop();
              }, user)(),
            ),
        ],
      ]}
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
              setUser(
                produce((user) => {
                  user.courses[i].year = year;
                }, user)(),
              );
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
                handleChange={(value) => {
                  setUser(
                    produce((user) => {
                      user.courses[i].name = value;
                    }, user)(),
                  );
                }}
              />
              {attachment ? (
                <div className="flex">
                  <FileAttachment url={attachment || ""} />
                  <button
                    className="hover:underline text-dark-gray ml-4 text-[20px]"
                    onClick={() => {
                      if (attachment?.startsWith("blob")) {
                        URL.revokeObjectURL(attachment);
                      }
                      setUser(
                        produce(user, (user) => {
                          user.courses[i].attachment = null;
                        }),
                      );
                    }}
                  >
                    (Удалить файл)
                  </button>
                </div>
              ) : (
                <label className="hover:underline cursor-pointer text-dark-gray ml-4 text-[20px]">
                  <input
                    className="hidden"
                    type="file"
                    onChange={({ target: { files } }) => {
                      if (!files || files.length < 1) {
                        return;
                      }
                      if (attachment?.startsWith("blob")) {
                        URL.revokeObjectURL(attachment);
                      }
                      const file = files[0];
                      let url = URL.createObjectURL(file);
                      const ext = fileExtention(file.name);
                      if (ext) {
                        url += "." + ext;
                      }
                      setUser(
                        produce((user) => {
                          user.courses[i].attachment = url;
                        }, user)(),
                      );
                    }}
                  />
                  + Загрузить файл
                </label>
              )}
            </div>
          ) : (
            <div>
              <div>{name}</div>
              <FileAttachment url={attachment || ""} />
            </div>
          )}
        </>
      ))}
    </Timeline>
  );

  return (
    <section>
      <SectionTitle title="Образование" />

      <HigherEducationInfo user={user} setUser={setUser} editing={editing} />

      <Property icon={layersIcon} name="Курсы" />
      <div className={clsx(editing ? "my-6" : "my-12")}>{courses}</div>
    </section>
  );
}

const TrainingInfo = ({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) => {
  const changeName = (i: number, value: string) =>
    setUser(
      produce(user, (user) => {
        user.training[i].name = value;
      }),
    );

  const pushItem = () =>
    setUser(
      produce(user, (user) => {
        user.training.push({ name: "", attachment: null });
      }),
    );

  const popItem = () =>
    setUser(
      produce(user, (user) => {
        user.training.pop();
      }),
    );

  const changeFile = (i: number, files: FileList | null) => {
    if (!files || files.length < 1) {
      return;
    }
    const { attachment } = user.training[i];
    if (attachment?.startsWith("blob")) {
      URL.revokeObjectURL(attachment);
    }
    const file = files[0];
    let url = URL.createObjectURL(file);
    const ext = fileExtention(file.name);
    if (ext) {
      url += "." + ext;
    }
    setUser(
      produce((user) => {
        user.training[i].attachment = url;
      }, user)(),
    );
  };

  const removeFile = (i: number) => {
    const { attachment } = user.training[i];
    if (attachment?.startsWith("blob")) {
      URL.revokeObjectURL(attachment);
    }
    setUser(
      produce((user) => {
        user.training[i].attachment = null;
      }, user)(),
    );
  };

  const certificates = user.training.map(({ name, attachment }, i) => {
    return (
      <li key={i}>
        {editing ? (
          <input
            required
            value={name}
            onChange={({ target: { value } }) => changeName(i, value)}
            className="mb-1 px-[20px] py-[6px] border rounded"
          />
        ) : (
          <span>{name}</span>
        )}
        {editing ? (
          attachment ? (
            <div className="">
              <FileAttachment url={attachment} />
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
              <input
                type="file"
                className="hidden"
                onChange={({ target: { files } }) => changeFile(i, files)}
              />
              + Загрузить файл
            </label>
          )
        ) : (
          attachment && (
            <>
              {", "}
              <FileAttachment url={attachment} />
            </>
          )
        )}
      </li>
    );
  });

  return (
    <div>
      <Property icon={upArrowIcon} name="Повышение квалификации" />
      <div className="ml-8 mt-2">
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

function CareerSection({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) {
  const positions = user.career.map(
    ({ year_start, year_leave, position }, i) => (
      <tr key={i} className="h-[45px]">
        <td className="w-[136px] border border-dark-gray">
          <input
            required
            disabled={!editing}
            className="w-full rounded text-center outline-none bg-white"
            value={year_start.toString()}
            onChange={({ target: { value } }) =>
              setUser(
                produce((user) => {
                  const year_start = Number(value);
                  if (!Number.isNaN(year_start)) {
                    user.career[i].year_start = year_start;
                  }
                }, user)(),
              )
            }
          />
        </td>
        <td className="w-[136px] border border-dark-gray">
          <input
            required
            disabled={!editing}
            className="w-full rounded text-center outline-none bg-white"
            value={year_leave?.toString() || "н. вр."}
            onChange={({ target: { value } }) =>
              setUser(
                produce((user) => {
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
                }, user)(),
              )
            }
          />
        </td>
        <td className="border border-dark-gray pl-[30px]">
          <input
            required
            disabled={!editing}
            className="rounded w-full outline-none bg-white"
            value={position}
            onChange={({ target: { value } }) =>
              setUser(
                produce((user) => {
                  user.career[i].position = value;
                }, user)(),
              )
            }
          />
        </td>
      </tr>
    ),
  );

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
                setUser(
                  produce((user) => {
                    user.workExperience = value;
                  }, user)(),
                )
              }
            />
          </div>
        </EditableProperty>

        <Property icon={externalIcon} name="Карьерный рост" />
        <table className="rounded-table w-full border border-dark-gray mb-[15px]">
          <tbody>
            <tr className="h-[45px]">
              <th
                colSpan={2}
                className="border border-dark-gray text-dark-gray font-normal text-center"
              >
                Годы
              </th>
              <th className="border border-dark-gray text-dark-gray font-normal pl-[30px] text-left">
                Должность
              </th>
            </tr>
            {positions}
            {editing && (
              <tr className="h-[45px]">
                <td colSpan={3} className="h-full w-full">
                  <div className="h-full text-dark-gray flex">
                    <button
                      type="button"
                      className="grow basis-0 hover:underline border-r"
                      onClick={() =>
                        setUser(
                          produce(user, (user) => {
                            const n = user.career.length;
                            const y = new Date().getFullYear();
                            const year_leave =
                              n > 0 ? user.career[n - 1].year_start : null;
                            const year_start = year_leave ? year_leave - 1 : y;
                            user.career.push({
                              year_start,
                              year_leave,
                              month_start: null,
                              month_leave: null,
                              position: "",
                            });
                          }),
                        )
                      }
                    >
                      + Добавить
                    </button>
                    <button
                      type="button"
                      className="grow basis-0 hover:underline"
                      onClick={() =>
                        setUser(
                          produce(user, (user) => {
                            user.career.pop();
                          }),
                        )
                      }
                    >
                      - Удалить
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <EditableProperty wrap icon={bookIcon} name="Навыки и компетенции">
          {editing ? (
            <textarea
              className={clsx("w-full mt-2 px-5 py-2", "rounded border")}
              value={user.skills}
              onChange={({ target: { value } }) =>
                setUser({ ...user, skills: value })
              }
            />
          ) : (
            <span>{user.skills}</span>
          )}
        </EditableProperty>

        <TrainingInfo user={user} setUser={setUser} editing={editing} />
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
    <button type="button" className={style} onClick={props.onClick}>
      {props.text}
    </button>
  );
}

function UserAvatarLink({ user }: { user: User }) {
  return (
    <Link to={`/profile/${user.id}`} className="shrink-0 w-fit hover:underline">
      <div className="rounded-photo overflow-hidden">
        <Picture width="210px" height="210px" url={userPhotoPath(user)} />
      </div>
      <div className="text-center mt-[16px]">{fullNameShort(user)}</div>
    </Link>
  );
}

function TeamSection({ user }: { user: User }) {
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
}

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
          hide={i + window > items.length}
          onClick={() => setIdx(i + 1)}
        />
      </div>
    </div>
  );
};

function GallerySection({
  user,
  setUser,
  editing,
  attr,
  window,
  title,
  height,
  gap,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
  attr: "awards" | "communityWork";
  window: number;
  title: string;
  height: string | number;
  gap: string | number;
}) {
  const pushItem = () =>
    setUser(
      produce(user, (user) => {
        user[attr].push({ name: "", attachment: null });
      }),
    );

  const deleteItem = (i: number) => () =>
    setUser(
      produce(user, (user) => {
        user[attr].splice(i, 1);
      }),
    );

  const changeTitle = (i: number, value: string) =>
    setUser(
      produce(user, (user) => {
        user[attr][i].name = value;
      }),
    );

  const changeImage = (i: number, files: FileList | null) => {
    if (!files || files.length < 1) {
      return;
    }
    const { attachment: image } = user[attr][i];
    if (image?.startsWith("blob")) {
      URL.revokeObjectURL(image);
    }
    const file = files[0];
    const url = URL.createObjectURL(file);
    setUser(
      produce((user) => {
        user[attr][i].attachment = url;
      }, user)(),
    );
  };

  const items = user[attr].map(({ name: title, attachment }, i) => (
    <div key={i} className="relative">
      {editing && (
        <button
          type="button"
          onClick={deleteItem(i)}
          style={{ width: 24, height: 24, translate: "-25% 0" }}
          className="absolute left-[100%] bottom-[100%]"
        >
          <img src={crossIcon} />
        </button>
      )}
      {attachment && (
        <img
          src={fullImagePath(attachment)}
          style={{ height }}
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
              <input
                required
                type="file"
                className="hidden"
                onChange={({ target: { files } }) => changeImage(i, files)}
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
          className="mt-8 w-full px-3 py-3 resize-none bg-white"
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
}

const AwardsSection = ({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) => (
  <GallerySection
    attr="awards"
    title="Награды"
    window={4}
    height={240}
    gap={40}
    user={user}
    setUser={setUser}
    editing={editing}
  />
);

const CommunityWorkSection = ({
  user,
  setUser,
  editing,
}: {
  user: User;
  setUser: (user: User) => void;
  editing: boolean;
}) => (
  <GallerySection
    attr="communityWork"
    title="Общественная работа"
    window={5}
    height={200}
    gap={30}
    user={user}
    setUser={setUser}
    editing={editing}
  />
);

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
      {editing ? (
        <textarea
          value={user.about}
          className="w-full p-[22px] h-48 rounded border"
          onChange={({ target: { value } }) =>
            setUser({ ...user, about: value })
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
}

function FeedbackSection({ user }: { user: User }) {
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
        <img style={{ width: "52px", height: "52px" }} src={icon} alt="" />
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
    // FIXME:
    // setEditing(false);
  }, [user]);

  if (!user || !userState || !baseUserState) {
    return <div>Loading...</div>;
  }

  const title =
    userId == "me" || auth.userId === userId ? "Мой профиль" : user.firstName;

  const handleSubmit: FormEventHandler = (event) => {
    console.log("submit");
    event.preventDefault();
    if (editing) {
      updateUser(auth.token, userState).catch(() => setUserState(user));
    }
    setBaseUserState(userState);
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
                  setUserState(baseUserState);
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
                setUser={setUserState}
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
}

export default UserProfile;
