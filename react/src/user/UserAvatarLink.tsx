import { Link } from "react-router-dom";

import { fullNameShort, userPhotoPath } from "@/common/util";
import { User } from "./types";

import { Picture } from "@/common/Picture";

export const UserAvatarLink = ({
  user,
  width,
  height,
  fontSize,
}: {
  user: User;
  width: string;
  height: string;
  fontSize: string;
}) => {
  return (
    <Link to={`/profile/${user.id}`} className="shrink-0 w-fit hover:underline">
      <div className="rounded-photo overflow-hidden">
        <Picture width={width} height={height} url={userPhotoPath(user)} />
      </div>
      <div style={{ fontSize }} className="text-center mt-[16px]">
        {fullNameShort(user)}
      </div>
    </Link>
  );
};
