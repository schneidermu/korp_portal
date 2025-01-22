import { useMemo } from "react";

import clsx from "clsx/lite";
import { useParams } from "react-router-dom";

import { cmpUsers, useFetchUsers } from "./api";
import { useQuery } from "./hooks";
import { filterUsers, User } from "./types";

import { AnimatePage, PageSkel } from "@/app/Page";
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

export const UserList = () => {
  const params = useParams();

  const { data: allUsers } = useFetchUsers();

  const { query, setQuery } = useQuery("/list", params.query);

  const users = useMemo(() => {
    if (!allUsers) {
      return [];
    }
    let users = [...allUsers.values()];
    for (const term of query) {
      users = filterUsers(users, term, FILTER_FIELDS);
    }
    users.sort(cmpUsers);
    return users;
  }, [allUsers, query]);

  if (allUsers === undefined) {
    return;
  }

  const id = query.slice(0, -1).join("+");

  return (
    <AnimatePage id={id}>
      <SearchBar
        query={query}
        setQuery={({ query, reload }) => setQuery(query, reload)}
      />
      <div className="h-[45px]"></div>
      <PageSkel title="Список сотрудников" heading="Список сотрудников" id={id}>
        <div className="flex flex-col gap-[56px] mr-[36px] ml-[64px] pb-[60px]">
          {users.map((user) => (
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
      </PageSkel>
    </AnimatePage>
  );
};
