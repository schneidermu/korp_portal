import useSWR from "swr";

import { useTokenFetcher } from "@/features/auth/hooks";
import { useAuth } from "@/features/auth/slice";

import { APIError } from "@api/common/errors";

import { User, toUser } from "./types";

export class UserNotFoundError extends Error {
  constructor() {
    super("UserNotFoundError");
  }
}

export const useFetchUser = (userId: string | null) => {
  const auth = useAuth();
  const tokenFetcher = useTokenFetcher();

  if (userId === auth.userId) {
    userId = "me";
  }

  return useSWR<User>(
    userId === null ? null : `/colleagues/${userId}/?v=2`,
    async (path: string) =>
      tokenFetcher(path)
        .then((res) => {
          if (res.status === 404) {
            throw new UserNotFoundError();
          }
          if (res.status !== 200) {
            throw new APIError(`fetching user (${userId})`, res);
          }
          return res.json();
        })
        .then((raw) => toUser(raw)),
  );
};
