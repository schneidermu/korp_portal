import clsx from "clsx";
import { ProfileCard } from "./UserProfile";
import { cmpUsers, useFetchUsers } from "./users/api";
import { AnimatePage, PageSkel } from "./Page";
import SearchBar from "./SearchBar";
import { useEffect, useMemo, useState } from "react";
import { User } from "./types";
import { fullNameLong, fullNameShort } from "./util";
import { useNavigate, useParams } from "react-router-dom";

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

export function UserList() {
  const navigate = useNavigate();
  const params = useParams();

  const { data: allUsers } = useFetchUsers();

  const [query, setQuery] = useState<string[]>([""]);
  const [pagePath, setPagePath] = useState(
    `/list/${query.slice(0, -1).join("+")}`,
  );

  useEffect(() => {
    if (!params.query) {
      return;
    }
    setPagePath(`/list/${params.query}`);
    const terms = params.query.split("+");
    terms.push("");
    setQuery(terms);
  }, [params.query]);

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
    <AnimatePage id={pagePath}>
      <SearchBar
        query={query}
        setQuery={({ query, reload }) => {
          setQuery(query);
          if (reload) {
            const path = `/list/${query.slice(0, -1).join("+")}`;
            setPagePath(path);
            navigate(path);
            console.log("new page path", path);
          }
        }}
      />
      <div className="h-[45px]"></div>
      <PageSkel
        title="Список сотрудников"
        heading="Список сотрудников"
        id={pagePath}
      >
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
}

export default UserList;
