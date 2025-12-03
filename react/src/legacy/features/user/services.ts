import { useEffect, useMemo } from "react";

import { Option as O, Option } from "effect";
import { produce } from "immer";
import useSWR, { mutate } from "swr";
import useSWRInfinite from "swr/infinite";

import { USERS_PAGE_LIMIT } from "@app/const";

import { tokenFetch, useTokenFetcher } from "@legacy/features/auth/hooks";
import { Paged } from "@api/common/types";
import {
  fileExtension,
  fullNameLong,
  sorted,
  trimExtension,
} from "@legacy/shared/utils";
import { User, UserStatus } from "./types";
import { AuthState, useAuth } from "../auth/slice";

export const UserNotFoundError = new Error("User not found");

type UserData = {
  id: string; // UUID
  email: string | null;
  username: string;
  is_superuser: boolean;
  surname: string | null;
  name: string | null;
  patronym: string | null;
  sex: "Мужской" | "Женский" | "Не указан" | null;
  status: UserStatus | null;
  birth_date: string | null;
  telephone_number: string | null;
  inner_telephone_number: string | null;
  office: string | null;
  job_title: string | null;
  class_rank: string | null;
  chief: string | null; // UUID
  structural_division?: null | {
    id: number;
    name: string;
    parent_structural_subdivision: number | null;
  };
  organization?: null | { id: number; name: string };
  average_rating: number | null;
  num_rates: number;
  rated_by_me: number | null;
  avatar: string | null; // URI
  agreed_with_data_processing: boolean;
  characteristic: null | {
    experience: string;
    about: string | null;
    competences: { name: string }[];
    careers: {
      name: string;
      year_start: number;
      month_start: number | null;
      year_finish: number | null;
      month_finish: number | null;
    }[];
    universitys: {
      name: string;
      faculty: string | null;
      year: number | null;
      month: number | null;
      file?: string | null; // URI
    }[];
    courses: {
      name: string;
      year: number | null;
      month: number | null;
      file?: string | null; // URI
    }[];
    rewards: {
      name: string;
      file?: string | null; // URI
    }[];
    trainings: {
      name: string;
      year: number | null;
      file?: string | null; // URI
    }[];
    volunteers: {
      name: string;
      file?: string | null;
    }[];
  };
};

const toUser = (data: UserData): User => {
  const char = data.characteristic;
  const unit = data.structural_division;
  return {
    id: data.id,
    email: data.username,
    username: data.username,
    isAdmin: data.is_superuser,
    lastName: data.surname ?? "?",
    firstName: data.name ?? "?",
    patronym: O.fromNullable(data.patronym),
    sex:
      data.sex === "Мужской"
        ? "male"
        : data.sex === "Женский"
          ? "female"
          : null,
    status: data.status ?? "На рабочем месте",
    dateOfBirth: O.fromNullable(data.birth_date),
    phoneNumber: data.telephone_number ?? "",
    innerPhoneNumber: data.inner_telephone_number ?? "",
    office: data.office ?? "",
    workExperience: O.fromNullable(char?.experience),
    about: char?.about ?? "",
    skills: sorted(char?.competences.map(({ name }) => name) ?? []),
    photo: O.fromNullable(data.avatar),
    position: data.job_title ?? "",
    serviceRank: data.class_rank ?? "",
    bossId: O.fromNullable(data.chief),
    unit: O.fromNullable(unit).pipe(
      O.map((unit) => ({
        id: unit.id,
        name: unit.name,
        parentId: unit.parent_structural_subdivision,
      })),
    ),
    organization: Option.fromNullable(data.organization),
    avgRating: Option.fromNullable(data.average_rating),
    myRating: Option.fromNullable(data.rated_by_me),
    numRates: data.num_rates,
    agreeDataProcessing: data.agreed_with_data_processing,
    career:
      char?.careers.map((c) => ({
        position: c.name,
        year_start: c.year_start,
        month_start: O.fromNullable(c.month_start),
        year_leave: O.fromNullable(c.year_finish),
        month_leave: O.fromNullable(c.month_finish),
      })) || [],
    training:
      char?.trainings.map((t) => ({
        year: t.year ?? 0,
        name: t.name,
        attachment: O.fromNullable(t.file),
      })) || [],
    education:
      char?.universitys.map((u) => ({
        year: u.year ?? 0,
        university: u.name,
        major: u.faculty ?? "",
      })) || [],
    courses:
      char?.courses.map(({ name, file, year }) => ({
        year: year ?? 0,
        name: name,
        attachment: O.fromNullable(file),
      })) || [],
    communityWork:
      char?.volunteers.map(({ name, file }) => ({
        name,
        attachment: O.fromNullable(file),
      })) || [],
    awards:
      char?.rewards.map(({ name, file }) => ({
        name,
        attachment: O.fromNullable(file),
      })) || [],
  };
};

const fromUser = (user: User): UserData => ({
  id: user.id,
  email: user.email,
  username: user.username,
  is_superuser: user.isAdmin,
  surname: user.lastName,
  name: user.firstName,
  patronym: O.getOrNull(user.patronym),
  sex:
    user.sex === "male" ? "Мужской" : user.sex === "female" ? "Женский" : null,
  status: user.status,
  birth_date: O.getOrNull(user.dateOfBirth),
  telephone_number: user.phoneNumber,
  inner_telephone_number: user.innerPhoneNumber,
  office: user.office,
  job_title: user.position,
  class_rank: user.serviceRank,
  chief: O.getOrNull(user.bossId),
  structural_division: O.map(user.unit, (unit) => ({
    id: unit.id,
    name: unit.name,
    parent_structural_subdivision: unit.parentId,
  })).pipe(O.getOrNull),
  organization: O.getOrNull(user.organization),
  average_rating: Option.getOrNull(user.avgRating),
  rated_by_me: Option.getOrNull(user.myRating),
  num_rates: user.numRates,
  avatar: O.getOrNull(user.photo),
  agreed_with_data_processing: user.agreeDataProcessing,
  characteristic: {
    experience: O.getOrElse(user.workExperience, () => ""),
    about: user.about,
    competences: user.skills.map((name) => ({ name })),
    careers: user.career.map((c) => ({
      name: c.position,
      year_start: c.year_start,
      month_start: O.getOrNull(c.month_start),
      year_finish: O.getOrNull(c.year_leave),
      month_finish: O.getOrNull(c.month_leave),
    })),
    universitys: user.education.map((e) => ({
      name: e.university,
      faculty: e.major,
      year: e.year,
      month: null,
      file: undefined,
    })),
    courses: user.courses.map((c) => ({
      name: c.name,
      year: c.year,
      month: null,
      file: O.getOrUndefined(c.attachment),
    })),
    rewards: user.awards.map((a) => ({
      name: a.name,
      file: O.getOrUndefined(a.attachment),
    })),
    trainings: user.training.map((t) => ({
      name: t.name,
      year: t.year,
      file: O.getOrUndefined(t.attachment),
    })),
    volunteers: user.communityWork.map(({ name, attachment }) => ({
      name,
      file: O.getOrUndefined(attachment),
    })),
  },
});

export const useFetchUsers = ({
  orgId,
  unitId,
  sort,
  query,
}: {
  orgId: number | null;
  unitId?: number | null;
  sort?: boolean;
  query?: string;
}) => {
  const tokenFetcher = useTokenFetcher();

  const limit = USERS_PAGE_LIMIT;

  const getKey = (index: number, prevPage: Paged<UserData>) => {
    if (!orgId && (!query || query.length < 3)) {
      return null;
    }
    let key = `/colleagues/?limit=${limit}`;
    if (sort) {
      key += `&sort_by=name`;
    }
    if (orgId) {
      key += `&structural_division__organization__id=${orgId}`;
    } else {
      key += `&structural_division__id__isnull=${orgId === 0 ? "true" : "false"}`;
    }
    if (typeof unitId === "number") {
      key += `&structural_division__id=${unitId}`;
    }
    if (!orgId && query) {
      key += `&search=${query}`;
    }
    if (index === 0) return key;
    if (prevPage && prevPage.next === null) return null;
    const offset = limit * index;
    return `${key}&offset=${offset}`;
  };

  const fetcher = async (path: string) =>
    tokenFetcher(path)
      .then((res) => res.json())
      .then((page: Paged<UserData>) => ({
        ...page,
        results: page.results.map((data) => {
          const user = toUser(data);
          mutate(`/colleagues/${user.id}/`, user, { revalidate: false });
          return user;
        }),
      }));

  const {
    data: pages,
    isLoading,
    error,
    size,
    setSize,
  } = useSWRInfinite<Paged<User>>(getKey, fetcher, {
    keepPreviousData: false,
    revalidateFirstPage: false,
  });

  const users = useMemo(
    () =>
      new Map(
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

export const cmpUsers = (u1: User, u2: User): -1 | 0 | 1 => {
  const n1 = fullNameLong(u1);
  const n2 = fullNameLong(u2);
  if (n1 < n2) return -1;
  if (n1 > n2) return +1;
  if (u1.id < u2.id) return -1;
  if (u1.id > u2.id) return +1;
  return 0;
};

interface Tree<T> {
  value: T;
  branches: Tree<T>[];
}

export const sortUsers = (users: User[]): User[] => {
  const trees = new Map<string, Tree<User>>(
    users.map((user) => [user.id, { value: user, branches: [] }]),
  );

  const roots: Tree<User>[] = [];

  for (const user of users) {
    const tree = trees.get(user.id)!;
    const bossTree = O.map(user.bossId, (bossId) => trees.get(bossId)).pipe(
      O.getOrUndefined,
    );
    if (bossTree) {
      bossTree.branches.push(tree);
    } else {
      roots.push(tree);
    }
  }

  const sorted: User[] = [];

  const flattenTrees = (trees: Tree<User>[]) => {
    trees.sort((t1, t2) => {
      // Sort subordinates with no own subordinates first.
      if (t1.value.unit === null && t2.value.unit !== null) {
        return +1;
      }
      if (t1.value.unit !== null && t2.value.unit === null) {
        return -1;
      }
      // Sort subordinates with no own subordinates first.
      if (t1.branches.length === 0 && t2.branches.length > 0) {
        return -1;
      }
      if (t1.branches.length > 0 && t2.branches.length === 0) {
        return +1;
      }
      return cmpUsers(t1.value, t2.value);
    });
    for (const { value, branches } of trees) {
      sorted.push(value);
      if (branches.length > 0) {
        flattenTrees(branches);
      }
    }
  };

  flattenTrees(roots);

  return sorted;
};

export const useFetchUsersSubset = ({
  unitId,
  bossId,
}: {
  unitId?: number;
  bossId?: string;
}) => {
  const tokenFetcher = useTokenFetcher();

  const query = [];
  if (unitId !== undefined) query.push(`structural_division__id=${unitId}`);
  if (bossId !== undefined) query.push(`chief__id=${bossId}`);

  const uri = "/colleagues/?" + query.join("&");
  const key = query.length === 0 ? null : uri;

  return useSWR(key, async (path: string) =>
    tokenFetcher(path)
      .then((res) => res.json())
      .then((usersData: UserData[]) => {
        const users = usersData.map(toUser);
        users.sort(cmpUsers);
        for (const user of users.values()) {
          mutate(`/colleagues/${user.id}/`, user, { revalidate: false });
        }
        return users;
      }),
  );
};

export const useFetchColleagues = (
  user: User,
): Map<string, User> | undefined => {
  const s1 = useFetchUsersSubset({
    unitId: O.map(user.unit, (unit) => unit.id).pipe(O.getOrUndefined),
  });
  const s2 = useFetchUsersSubset({ bossId: user.id });

  return useMemo(() => {
    const s = [...(s1?.data || []), ...(s2?.data || [])];
    if (s.length === 0) return;
    s.sort(cmpUsers);
    return new Map(s.map((user) => [user.id, user]));
  }, [s1?.data, s2?.data]);
};

export const useFetchUser = (userId: O.Option<string>) => {
  const auth = useAuth();
  const tokenFetcher = useTokenFetcher();

  const { data, ...rest } = useSWR<User>(
    O.map(
      userId,
      (id) => `/colleagues/${id === auth.userId ? "me" : id}/`,
    ).pipe(O.getOrNull),
    async (path: string) =>
      tokenFetcher(path)
        .then((res) => {
          if (res.status === 404) {
            throw UserNotFoundError;
          }
          return res.json();
        })
        .then((data) => {
          return toUser(data);
        }),
  );

  return {
    user: data,
    ...rest,
  };
};

export const uploadFile = async (token: string, uri: string | null) => {
  if (!uri?.startsWith("blob:") && !uri?.startsWith("data:")) {
    return uri ?? undefined;
  }
  const ext = fileExtension(uri);
  if (uri.startsWith("blob:") && !ext) {
    return;
  }
  uri = trimExtension(uri);
  const blob = await fetch(uri).then((res) => res.blob());
  const formData = new FormData();
  const timestamp = new Date().getTime();
  formData.append("file", blob, `${timestamp}.${ext}`);
  return tokenFetch(token, `/upload-file/`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then(({ file }) => decodeURI(file));
};

export const saveUser = async (auth: AuthState, user: User) => {
  user = {
    ...user,
    // Drop entries with empty images.
    awards: user.awards.filter(({ attachment }) => O.isSome(attachment)),
    communityWork: user.communityWork.filter(({ attachment }) =>
      O.isSome(attachment),
    ),
  };

  const data = fromUser(user);

  const attrs = [
    ["courses", "courses"],
    ["training", "trainings"],
    ["awards", "rewards"],
    ["communityWork", "volunteers"],
  ] as const;

  await Promise.all([
    uploadFile(auth.token, O.getOrNull(user.photo)).then((file) => {
      data.avatar = file ?? null;
    }),
    ...attrs.flatMap(([attr, apiAttr]) =>
      (user[attr] || []).map(({ attachment }, i) =>
        uploadFile(auth.token, O.getOrNull(attachment))
          .then((file) => {
            if (data.characteristic) {
              data.characteristic[apiAttr][i].file = file;
            }
          })
          .catch(console.error),
      ),
    ),
  ]);

  const userId = auth.userId === user.id ? "me" : user.id;

  return tokenFetch(auth.token, `/colleagues/${userId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (res) => {
      const data = await res.json();
      if (res.status !== 200) {
        throw new Error(JSON.stringify(data));
      }
      return data;
    })
    .then((userData) => {
      const user = toUser(userData);
      const opt = {
        revalidate: false,
      };
      mutate(`/colleagues/${userId}/`, user, opt);
      mutate(
        "/colleagues/",
        (users?: Map<string, User>) => {
          if (!users) return undefined;
          return produce(users, (users) => {
            users.set(user.id, user);
          });
        },
        opt,
      );
    });
};
