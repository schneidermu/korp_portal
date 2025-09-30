import * as R from "radashi";

import { User } from "./types";

export const fullNameShort = (user: User): string => {
  const parts = R.sift([user.lastName, user.firstName, user.patronym]);
  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i][0] + ".";
  }
  return parts.join(" ");
};
