import { useMemo } from "react";

import clsx from "clsx/lite";
import { Link, useParams } from "react-router-dom";

import { formatMobilePhone, fullNameLong } from "@/common/util";
import { cmpUsers, useFetchUsers } from "./api";
import { useQuery } from "./hooks";
import { filterUsers, Unit, User } from "./types";

import { AnimatePage, PageSkel } from "@/app/Page";
import { SearchBar } from "@/common/SearchBar";

const FILTER_FIELDS = new Set<keyof User>(["unit", "position", "phoneNumber"]);

/**
 * Group users by their units, flattening the unit hierarchy tree.
 * Ensure that sibling units and users within each unit are ordered by name.
 */
const groupUsersByUnits = (users: User[]) => {
  const parent2children = new Map<
    number | null,
    Map<number, { unit: Unit; users: User[] }>
  >();

  for (const user of users) {
    const { unit } = user;
    if (!unit) {
      continue;
    }
    const children = parent2children.get(unit.parentId) || new Map();
    parent2children.set(unit.parentId, children);
    const child = children.get(unit.id);
    if (!child) {
      children.set(unit.id, { unit, users: [user] });
    } else {
      child.users.push(user);
    }
  }
  for (const [, children] of parent2children) {
    for (const [, { users }] of children) {
      users.sort(cmpUsers);
    }
  }

  const units: { unit: string; users: User[] }[] = [];

  const pushChildrenOf = (parentId: number | null) => {
    const children = parent2children.get(parentId);
    if (!children) {
      return;
    }
    const flatChildren = [...children.values()];
    flatChildren.sort(({ unit: u1 }, { unit: u2 }) => {
      if (u1.name < u2.name) return -1;
      if (u1.name > u2.name) return +1;
      return 0;
    });
    for (const { unit, users } of flatChildren) {
      units.push({ unit: unit.name, users });
      pushChildrenOf(unit.id);
    }
  };

  pushChildrenOf(null);

  return units;
};

export const UnitList = () => {
  const params = useParams();

  const { query, setQuery } = useQuery("/units", params.query);

  const { data: allUsers } = useFetchUsers();

  const allUnits = useMemo(() => {
    if (!allUsers) {
      return [];
    }
    return groupUsersByUnits([...allUsers.values()]);
  }, [allUsers]);

  const units = useMemo(() => {
    const units: typeof allUnits = [];
    for (const v of allUnits) {
      const { unit } = v;
      let users = v.users;
      for (const term of query) {
        users = filterUsers(users, term, FILTER_FIELDS);
      }
      if (users.length > 0) {
        units.push({ unit, users });
      }
    }
    return units;
  }, [allUnits, query]);

  if (allUsers === undefined) {
    return;
  }

  const headerClass = clsx(
    "flex items-center justify-center",
    "border-t border-r border-b border-dark-gray",
    "px-6 py-3 font-medium text-center",
  );

  const cellClass = clsx(
    "flex items-center",
    "border-b border-r border-dark-gray",
    "px-6 py-5",
  );

  const id = query.slice(0, -1).join("+");

  return (
    <AnimatePage id={id}>
      <SearchBar
        query={query}
        setQuery={({ query, reload }) => setQuery(query, reload)}
      />
      <div className="h-[45px]"></div>
      <PageSkel title="Список отделов" heading="Список отделов" id={id}>
        <div className="w-full px-12 pb-24">
          <div className="grid grid-cols-[1fr,1fr,22%,auto,auto]">
            {/* Header row */}
            <div
              key="name"
              className={clsx(headerClass, "border-l rounded-tl")}
            >
              ФИО
            </div>
            <div key="position" className={headerClass}>
              Должность
            </div>
            <div key="mobilePhone" className={headerClass}>
              Телефон
            </div>
            <div key="phone" className={headerClass}>
              Внутренний <br /> телефон
            </div>
            <div key="office" className={clsx(headerClass, "rounded-tr")}>
              Кабинет
            </div>

            {/* Data rows */}
            {[...units].map(({ unit, users }, i) => (
              <>
                <div
                  key={"unit/" + unit}
                  className={clsx(
                    cellClass,
                    "col-span-5 border-l",
                    "flex justify-center",
                    "text-[28px] font-medium text-center",
                  )}
                >
                  <Link to={`/units/${unit}`} className="hover:underline">
                    {unit}
                  </Link>
                </div>
                {users.map((user, j) => {
                  const isLastRow =
                    i === units.length - 1 && j === users.length - 1;
                  return (
                    <>
                      <div
                        key={"name/" + user.id}
                        className={clsx(
                          cellClass,
                          "border-l",
                          isLastRow && "rounded-bl",
                        )}
                      >
                        <Link
                          to={`/profile/${user.id}`}
                          className="hover:underline"
                        >
                          {fullNameLong(user)}
                        </Link>
                      </div>
                      <div
                        key={"position/" + user.id}
                        className={clsx(cellClass, "")}
                      >
                        {user.position}
                      </div>
                      <div
                        key={"mobilePhone/" + user.id}
                        className={clsx(cellClass, "text-nowrap")}
                      >
                        {formatMobilePhone(user.phoneNumber)}
                      </div>
                      <div
                        key={"phone/" + user.id}
                        className={clsx(cellClass, "text-nowrap")}
                      ></div>
                      <div
                        key={"office/" + user.id}
                        className={clsx(
                          cellClass,
                          "text-nowrap",
                          isLastRow && "rounded-br",
                        )}
                      ></div>
                    </>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </PageSkel>
    </AnimatePage>
  );
};
