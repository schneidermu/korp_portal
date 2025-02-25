import React, { useMemo } from "react";

import clsx from "clsx/lite";

import {
  useIntSearchParam,
  useQuerySearchParam,
} from "@/common/useSearchParam";
import { cmpUsers, useFetchUser, useFetchUsers } from "./api";
import { useUserState } from "./hooks";
import { filterUsers, User } from "./types";

import { AnimatePage, PageSkel } from "@/app/Page";
import { OrgPicker } from "@/common/OrgPicker";
import { SearchBar } from "@/common/SearchBar";
import { ProfileCard } from "./ProfileCard";

const FILTER_FIELDS = new Set<keyof User>([
  "unit",
  "organization",
  "dateOfBirth",
  "position",
  "email",
  "phoneNumber",
  "serviceRank",
]);

const UserCard = React.memo(function UserCard({ userId }: { userId: string }) {
  const { user } = useFetchUser(userId);
  const [userState, updateUserState] = useUserState(user);

  if (!user || !userState) {
    return undefined;
  }

  return (
    <div
      className={clsx(
        "pt-[52px] pr-[25px] pb-[92px] pl-[36px]",
        "border-[3px] border-light-gray rounded",
      )}
    >
      <ProfileCard user={userState} updateUser={updateUserState} />
    </div>
  );
});

export const UserList = () => {
  const [orgId, setOrgId] = useIntSearchParam("org");
  const [query, setQuery] = useQuerySearchParam("q");

  const { data: allUsers } = useFetchUsers(orgId);

  const users = useMemo(() => {
    if (!allUsers) {
      return [];
    }
    let users = [...allUsers.values()];
    for (const term of query) {
      users = filterUsers(users, term, FILTER_FIELDS);
    }
    users = users.sort(cmpUsers);
    return users;
  }, [allUsers, query]);

  const id = query.slice(0, -1).join("+");

  return (
    <AnimatePage id={id}>
      <SearchBar query={query} setQuery={setQuery} />
      <div className="h-[45px]"></div>
      <PageSkel
        title="Список сотрудников"
        heading="Список сотрудников"
        id={id}
        slot={
          <div className="basis-1/4">
            <OrgPicker orgId={orgId} setOrgId={setOrgId} />
          </div>
        }
      >
        <div className="flex flex-col gap-[56px] mr-[36px] ml-[64px] pb-[60px]">
          {users.map((user) => (
            <UserCard key={user.id} userId={user.id} />
          ))}
        </div>
      </PageSkel>
    </AnimatePage>
  );
};
