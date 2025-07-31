import { useMemo } from "react";

import { Option as O } from "effect";
import { Temporal } from "temporal-polyfill";

import { useFetchUsers } from "@/features/user/services";
import { User } from "@/features/user/types";

export const useBirthdays = ({ orgId }: { orgId: number | null }) => {
  const {
    data: { users },
  } = useFetchUsers({ orgId });

  return useMemo(() => {
    const birthdays: { [key: string]: User[] } = {};

    for (const [, user] of users) {
      if (O.isSome(user.dateOfBirth)) {
        const date = Temporal.PlainDate.from(user.dateOfBirth.value);
        const key = `${date.month}/${date.day}`;
        birthdays[key] = birthdays[key] ?? [];
        birthdays[key].push(user);
      }
    }

    return birthdays;
  }, [users]);
};
