import clsx from "clsx/lite";

import { formatDate, formatDatePretty } from "@/shared/utils";

import * as types from "../types";

import { UserAvatarLink } from "@/features/user/comps/UserAvatarLink";

export const Birthday = ({
  birthday,
  full,
  handleOpen,
}: {
  birthday: types.Birthday;
  full?: boolean;
  handleOpen?: () => void;
}) => {
  return (
    <article className="mt-[60px] mx-[65px] mb-[50px]">
      <div className="flex items-center justify-end mb-[68px]">
        <a
          className="grow cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            if (handleOpen) handleOpen();
          }}
        >
          <h2 className={clsx("text-[32px]", full && "font-medium")}>
            Сегодня, {formatDatePretty(birthday.publishedAt)}, день рождения
            праздну{birthday.users.length > 1 ? "ют" : "ет"}
          </h2>
        </a>
        <time className={clsx("text-date shrink-0", full && "text-[32px]")}>
          {formatDate(birthday.publishedAt)}
        </time>
      </div>
      <div
        className={clsx(
          "grid grid-cols-4 gap-y-[68px] overflow-y-auto",
          full ? "max-h-[1000px]" : "max-h-[650px]",
        )}
      >
        {birthday.users.map((user) => (
          <UserAvatarLink
            target="_blank"
            key={user.id}
            user={user}
            width="230px"
            height="230px"
            fontSize="24px"
          />
        ))}
      </div>
    </article>
  );
};
