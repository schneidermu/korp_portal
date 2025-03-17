import clsx from "clsx/lite";
import { Link } from "react-router-dom";

import { ACCEPT_IMAGES } from "@/app/const";

import {
  UpdateUserFn,
  User,
  USER_STATUS,
  UserStatus,
} from "@/features/user/types";
import {
  formatDateOfBirth,
  formatMobilePhone,
  fullNameLong,
  MonomorphFields,
  noop,
  stripPhoneNumber,
  userPhotoPath,
} from "@/shared/utils";

import { Rating } from "@/features/rating/comps/Rating";
import { Icon } from "@/shared/comps/Icon";
import { Picture } from "@/shared/comps/Picture";

import {
  EditableProperty,
  FileInput,
  PropertyInput,
  PropertySelect,
} from "../parts/parts";

import atIcon from "@/assets/at.svg";
import awardIcon from "@/assets/award.svg";
import brightnessIcon from "@/assets/brightness.svg";
import giftIcon from "@/assets/gift.svg";
import peopleIcon from "@/assets/people.svg";
import personIcon from "@/assets/person.svg";
import phoneIcon from "@/assets/phone.svg";
import pinIcon from "@/assets/pin.svg";

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
            className="block w-full py-3 hover:underline text-center cursor-pointer select-none"
            onClick={(event) => event.stopPropagation()}
          >
            <FileInput
              accept={ACCEPT_IMAGES}
              onUpload={(url) => updateUser({ ...user, photo: url })}
            />
            Загрузить фото
          </label>
          <hr className="text-[#cecece]" />
          <button
            onClick={(event) => {
              event.stopPropagation();
              updateUser({ ...user, photo: null });
            }}
            className="w-full py-3 hover:underline select-none"
            type="button"
          >
            Удалить фото
          </button>
        </div>
      )}
    </Link>
  );
};

export const InfoGrid = ({
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
    wrap?: boolean;
  }) => (
    <EditableProperty key={field} icon={icon} name={name} wrap={!editing}>
      <PropertyInput
        type={type}
        pattern={pattern}
        editing={editing}
        value={user[field] ?? ""}
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
        <EditableProperty key="phoneNumber" icon={phoneIcon} name="Телефон">
          <PropertyInput
            editing={editing}
            value={user.phoneNumber}
            theme="py-[6px] px-[10px]"
            text={formatMobilePhone(user.phoneNumber)}
            handleChange={changePhoneNumber}
          />
        </EditableProperty>,
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
        wrap={!editing}
      >
        {!editing && user.organization !== null ? (
          <Link
            to={`/list?org=${user.organization.id}`}
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
          {!editing && user.organization !== null && user.unit !== null ? (
            <Link
              to={`/list?org=${user.organization.id}&q=${user.unit.name}`}
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
  return (
    <section className="-ml-[20px] flex flex-col gap-[20px]">
      <div className="flex gap-[64px] h-[340px]">
        <Avatar editing={editing} user={user} updateUser={updateUser} />

        <div className="w-full flex flex-col justify-between">
          <div className="flex">
            <Icon src={personIcon} width="33px" />
            <Link
              to={"/profile/" + user.id}
              className="ml-[28px] text-[30px] hover:underline"
            >
              <h2>{fullNameLong(user)}</h2>
            </Link>
          </div>

          <InfoGrid user={user} editing={editing} updateUser={updateUser} />
        </div>
      </div>

      <Rating user={user} />
    </section>
  );
};
