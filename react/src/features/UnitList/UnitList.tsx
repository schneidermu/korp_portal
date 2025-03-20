import { Fragment, useMemo } from "react";

import clsx from "clsx/lite";
import { Option as O } from "effect";
import { Link } from "react-router-dom";

import { sortUsers, useFetchUsers } from "@/features/user/services";
import { filterUsers, Unit, User } from "@/features/user/types";
import { formatMobilePhone, fullNameLong } from "@/shared/utils";

import { AnimatePage, PageSkel } from "@/features/App/comps/PageSkel";
import { OrgPicker } from "@/features/org/comps/OrgPicker";
import { SearchBar } from "@/shared/comps/SearchBar";
import {
  useIntSearchParam,
  useQuerySearchParam,
} from "@/shared/hooks/useSearchParam";

const FILTER_FIELDS = new Set<keyof User>([
  "unit",
  "position",
  "phoneNumber",
  "innerPhoneNumber",
  "office",
]);

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
    if (O.isNone(unit)) {
      continue;
    }
    const children = parent2children.get(unit.value.parentId) || new Map();
    parent2children.set(unit.value.parentId, children);
    const child = children.get(unit.value.id);
    if (!child) {
      children.set(unit.value.id, { unit, users: [user] });
    } else {
      child.users.push(user);
    }
  }
  for (const [, children] of parent2children) {
    for (const child of children.values()) {
      child.users = sortUsers(child.users);
    }
  }

  const units: { unit: Unit; org: User["organization"]; users: User[] }[] = [];

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
      units.push({ unit, org: users[0].organization, users });
      pushChildrenOf(unit.id);
    }
  };

  pushChildrenOf(null);

  return units;
};

export const UnitList = () => {
  const [orgId, setOrgId] = useIntSearchParam("org");
  const [query, setQuery] = useQuerySearchParam("q");

  const { data: allUsers } = useFetchUsers(orgId);

  const allUnits = useMemo(() => {
    if (!allUsers) {
      return [];
    }
    return groupUsersByUnits([...allUsers.values()]);
  }, [allUsers]);

  const units = useMemo(() => {
    const units: typeof allUnits = [];
    for (const v of allUnits) {
      const { unit, org } = v;
      let users = v.users;
      for (const term of query) {
        users = filterUsers(users, term, FILTER_FIELDS);
      }
      if (users.length > 0) {
        units.push({ unit, org, users });
      }
    }
    return units;
  }, [allUnits, query]);

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

  console.log({ id });

  return (
    <AnimatePage id={id}>
      <SearchBar query={query} setQuery={setQuery} />
      <div className="h-[45px]"></div>
      <PageSkel
        title="Список отделов"
        heading="Список отделов"
        id={id}
        slot={
          <div className="basis-1/4">
            <OrgPicker orgId={orgId} setOrgId={setOrgId} />
          </div>
        }
      >
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
            {[...units].map(({ unit, org, users }, i) => (
              <Fragment key={unit.id}>
                <div
                  className={clsx(
                    cellClass,
                    "col-span-5 border-l",
                    "flex justify-center",
                    "text-[28px] font-medium text-center",
                  )}
                >
                  <Link
                    to={
                      "?" +
                      new URLSearchParams([
                        ["q", unit.name],
                        ...(orgId === null ? [] : [["org", orgId.toString()]]),
                      ])
                    }
                    className="hover:underline"
                  >
                    {unit.name}{" "}
                    {orgId === null &&
                      O.map(org, ({ name }) => `(${name})`).pipe(
                        O.getOrUndefined,
                      )}
                  </Link>
                </div>
                {users.map((user, j) => {
                  const isLastRow =
                    i === units.length - 1 && j === users.length - 1;
                  return (
                    <Fragment key={user.id}>
                      <div
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
                      <div className={clsx(cellClass, "")}>{user.position}</div>
                      <div className={clsx(cellClass, "text-nowrap")}>
                        {formatMobilePhone(user.phoneNumber)}
                      </div>
                      <div className={clsx(cellClass, "text-nowrap")}>
                        {user.innerPhoneNumber}
                      </div>
                      <div
                        className={clsx(
                          cellClass,
                          "text-nowrap",
                          isLastRow && "rounded-br",
                        )}
                      >
                        {user.office}
                      </div>
                    </Fragment>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </PageSkel>
    </AnimatePage>
  );
};
