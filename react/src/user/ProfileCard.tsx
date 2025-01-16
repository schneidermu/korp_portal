import clsx from "clsx/lite";
import { Link } from "react-router-dom";

import { ACCEPT_IMAGES } from "@/app/const";

import {
  formatDateOfBirth,
  fullNameLong,
  MonomorphFields,
  noop,
  userPhotoPath,
} from "@/common/util";
import { UpdateUserFn, User, USER_STATUS, UserStatus } from "./types";

import { Picture } from "@/common/Picture";
import { EditableProperty, PropertyInput, PropertySelect } from "./common";

import atIcon from "/at.svg";
import awardIcon from "/award.svg";
import brightnessIcon from "/brightness.svg";
import giftIcon from "/gift.svg";
import peopleIcon from "/people.svg";
import personIcon from "/person.svg";
import phoneIcon from "/phone.svg";
import pinIcon from "/pin.svg";

const Avatar = ({
  user,
  updateUser,
  editing,
}: {
  user: User;
  updateUser: UpdateUserFn;
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
              accept={ACCEPT_IMAGES.join(",")}
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
                updateUser({ ...user, photo: url });
              }}
              onClick={(event) => event.stopPropagation()}
            />
            Загрузить фото
          </label>
          <hr className="text-[#cecece]" />
          <button
            onClick={(event) => {
              event.stopPropagation();
              updateUser({ ...user, photo: null });
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

export const ProfileCard = ({
  user,
  editing = false,
  updateUser = noop,
}: {
  user: User;
  editing?: boolean;
  updateUser?: UpdateUserFn;
}) => {
  const changeField =
    (key: MonomorphFields<User, string | null>) => (value: string) => {
      let v: string | null = value;
      if (key === "dateOfBirth" && !value) {
        v = null;
      }
      updateUser({ ...user, [key]: v });
    };

  const field = ({
    name,
    icon,
    field,
    type = "text",
    pattern,
  }: {
    name: string;
    icon: string;
    field: MonomorphFields<User, string | null>;
    type?: string;
    pattern?: string;
  }) => (
    <EditableProperty key={field} icon={icon} name={name}>
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
      <Avatar editing={editing} user={user} updateUser={updateUser} />
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
                updateUser({ ...user, status: value as UserStatus });
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
            {!editing && user.organization !== null ? (
              <Link
                to={`/list/${user.organization.name}`}
                className="hover:underline"
              >
                {user.organization.name}
              </Link>
            ) : (
              user.organization?.name
            )}
          </EditableProperty>
          <div className="row-span-3">
            <EditableProperty
              key="unit"
              name="Структурное подразделение"
              icon={peopleIcon}
              wrap
            >
              {!editing && user.unit !== null ? (
                <Link
                  to={`/list/${user.unit.name}`}
                  className="hover:underline"
                >
                  {user.unit.name}
                </Link>
              ) : (
                user.unit?.name
              )}
            </EditableProperty>
          </div>
        </div>
      </div>
    </section>
  );
};
