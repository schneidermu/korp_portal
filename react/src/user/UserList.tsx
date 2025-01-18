import { useEffect, useMemo, useState } from "react";

import clsx from "clsx/lite";
import { useNavigate, useParams } from "react-router-dom";

import { cmpUsers, useFetchUsers } from "./api";
import { filterUsers, User } from "./types";

import { AnimatePage, PageSkel } from "@/app/Page";
import { SearchBar } from "@/common/SearchBar";
import { ProfileCard } from "./ProfileCard";

const FILTER_FIELDS = new Set<keyof User>([
  "unit",
  "organization",
  "position",
  "email",
  "phoneNumber",
  "serviceRank",
]);

export const UserList = () => {
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
      users = filterUsers(users, term, FILTER_FIELDS);
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
};
