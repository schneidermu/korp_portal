import clsx from "clsx";
import { useUserId } from "./auth/slice";
import { ProfileCard } from "./UserProfile";
import { useFetchUser, useFetchUsers } from "./users/api";
import { fullNameLong } from "./util";
import { User } from "./types";

export default function OrgStruct({ unitId }: { unitId: string | null }) {
  const defaultUserId = useUserId();
  const { user } = useFetchUser(defaultUserId);
  const { data: users } = useFetchUsers();

  if (user === null || users === undefined) {
    return;
  }

  unitId ||= user.structuralUnit;
  const sortedUsers = [...users.values()];
  sortedUsers.sort((u1, u2) => {
    const n1 = fullNameLong(u1);
    const n2 = fullNameLong(u2);
    if (n1 < n2) {
      return -1;
    }
    if (n1 == n2) {
      return 0;
    }
    return +1;
  });
  const selectedUsers: User[] = [];
  for (const user of sortedUsers) {
    if (user.structuralUnit === unitId) {
      selectedUsers.push(user);
    }
  }
  return (
    <div className="flex flex-col gap-[56px] mr-[36px] ml-[64px] pb-[60px]">
      {selectedUsers.map((user) => (
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
