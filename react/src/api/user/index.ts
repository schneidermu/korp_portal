import { useEffect, useMemo } from "react";

import useSWR, { mutate } from "swr";
import useSWRInfinite from "swr/infinite";

import * as R from "radashi";

import { useTokenFetcher } from "@api/auth";
import { useAuth } from "@api/auth";

import { FETCH_USERS_PAGE_SIZE } from "@api/common/const";
import { APIError } from "@api/common/errors";
import { Paged } from "@api/common/types";

import { User, UserRaw, toUser } from "./types";

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

export const useFetchUsers = ({
  orgId,
  unitIsNull: orgIsNull,
  unitId,
  sort,
  query,
}: {
  orgId: number | null;
  unitIsNull?: boolean;
  unitId?: number | null;
  sort?: boolean;
  query?: string;
}) => {
  const tokenFetcher = useTokenFetcher();

  const getKey = (index: number, prevPage: Paged<UserRaw>) => {
    if (prevPage && prevPage.next === null) {
      return null;
    }

    return (
      "/colleagues/?" +
      R.sift([
        "v=2",
        `limit=${FETCH_USERS_PAGE_SIZE}`,
        `offset=${index * FETCH_USERS_PAGE_SIZE}`,
        query && `search=${query}`,
        sort && "sort_by=name",
        unitId && `&structural_division__id=${unitId}`,
        orgIsNull !== undefined &&
          `&structural_division__id__isnull=${orgIsNull ? "true" : "false"}`,
        orgIsNull === undefined &&
          orgId !== null &&
          `structural_division__organization__id=${orgId}`,
      ]).join("&")
    );
  };

  const {
    data: pages,
    isLoading,
    error,
    size,
    setSize,
  } = useSWRInfinite<Paged<User>>(
    getKey,
    async (path: string) =>
      tokenFetcher(path)
        .then((res) => {
          if (res.status !== 200) {
            throw new APIError(`fetching users for org ${orgId}`, res);
          }
          return res.json();
        })
        .then((page: Paged<UserRaw>) => ({
          ...page,
          results: page.results.map((data) => {
            const user = toUser(data);
            mutate(`/colleagues/${user.id}/?v=2`, user, { revalidate: false });
            return user;
          }),
        })),

    {
      keepPreviousData: false,
      revalidateFirstPage: false,
    },
  );

  const users = useMemo(
    () =>
      Object.fromEntries(
        pages?.flatMap((page) => page.results.map((user) => [user.id, user])) ??
          [],
      ),
    [pages],
  );

  const allAreLoaded = pages ? pages[pages.length - 1]?.next === null : false;

  useEffect(() => {
    if (pages?.length && pages?.length === size) {
      setSize(size + 1);
    }
  }, [size, pages?.length, setSize, allAreLoaded]);

  return {
    data: {
      isLoading,
      users,
      totalUsers: (pages && pages[0]?.count) ?? 0,
    },
    error,
  };
};
