import clsx from "clsx";
import { useUserId } from "./auth/slice";
import { ProfileCard } from "./UserProfile";
import { useFetchUser, useFetchUsersSubset } from "./users/api";

export default function OrgStruct({ unitId }: { unitId: number | null }) {
  const defaultUserId = useUserId();
  const { user } = useFetchUser(defaultUserId);
  const unitUsers = useFetchUsersSubset({ unitId: unitId || user?.unit?.id });

  if (
    user === null ||
    unitUsers === undefined ||
    unitUsers.data === undefined
  ) {
    return;
  }

  return (
    <div className="flex flex-col gap-[56px] mr-[36px] ml-[64px] pb-[60px]">
      {unitUsers.data.map((user) => (
        <div
          key={user.id}
          className={clsx(
            "pt-[52px] pr-[25px] pb-[92px] pl-[36px]",
            "border-[3px] border-light-gray rounded",
          )}
        >
          <ProfileCard user={user} />
        </div>
      ))}
    </div>
  );
}
