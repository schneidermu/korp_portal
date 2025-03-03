import { useCallback, useEffect, useState } from "react";

import { produce } from "immer";

import { trimExtention } from "@/shared/utils";

import { UpdateUserFn, User, userBlobURLs } from "./types";

const revokeUnusedURLs = (oldUser: User, user: User) => {
  const s1 = userBlobURLs(oldUser);
  const s2 = userBlobURLs(user);
  for (const url of s1) {
    if (s2.has(url)) {
      continue;
    }
    URL.revokeObjectURL(trimExtention(url));
  }
};

export const useUserState = (user: User | undefined) => {
  const [userState, setUserState] = useState<User | undefined>(user);

  const updateUserState = useCallback<UpdateUserFn>(
    (recipe) => {
      if (typeof recipe !== "function") {
        setUserState((user) => {
          if (user) {
            revokeUnusedURLs(user, recipe);
          }
          return recipe;
        });
        return;
      }
      setUserState((user) => {
        if (!user) {
          return;
        }
        return produce(user, (draft) => {
          recipe(draft);
          revokeUnusedURLs(user, draft);
        });
      });
    },
    [setUserState],
  );

  useEffect(() => {
    if (user) {
      updateUserState(user);
    }
  }, [updateUserState, user]);

  return [userState, updateUserState] as const;
};
