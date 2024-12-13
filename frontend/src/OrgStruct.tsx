import clsx from "clsx";
import { ProfileCard } from "./UserProfile";
import { cmpUsers, useFetchUsers } from "./users/api";
import { PageSkel } from "./Page";
import SearchBar from "./SearchBar";
import { useEffect, useMemo, useState } from "react";
import { User } from "./types";
import { fullNameLong, fullNameShort } from "./util";

const matchString = (q: string, s: string): boolean => {
  return s.toLowerCase().includes(q);
};

const filterUsers = (users: User[], term: string) => {
  term = term.toLowerCase();
  return users.filter((user) => {
    if (user.unit && matchString(term, user.unit.name)) return true;
    if (user.organization && matchString(term, user.organization.name))
      return true;
    if (matchString(term, fullNameLong(user))) return true;
    if (matchString(term, fullNameShort(user))) return true;
    if (matchString(term, user.position)) return true;
    if (matchString(term, user.status)) return true;
    if (matchString(term, user.email)) return true;
    if (matchString(term, user.phoneNumber)) return true;
    if (matchString(term, user.serviceRank)) return true;
    return false;
  });
};

export default function OrgStruct({
  initialQuery = [],
}: {
  initialQuery: string[];
}) {
  const { data: allUsers } = useFetchUsers();

  const [query, setQuery] = useState<string[]>([...initialQuery, ""]);

  useEffect(() => {
    setQuery([...initialQuery, ""]);
  }, [initialQuery]);

  const users = useMemo(() => {
    if (!allUsers) {
      return [];
    }
    let users = [...allUsers.values()];
    for (const term of query) {
      users = filterUsers(users, term);
    }
    users.sort(cmpUsers);
    return users;
  }, [allUsers, query]);

  if (allUsers === undefined) {
    return;
  }

  return (
    <>
      <SearchBar query={query} setQuery={setQuery} />
      <PageSkel title="Список сотрудников">
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
    </>
  );
}
