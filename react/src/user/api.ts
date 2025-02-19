import { produce } from "immer";
import useSWR, { mutate } from "swr";

import { tokenFetch, useTokenFetcher } from "@/auth/slice";
import { fileExtention, fullNameLong, trimExtention } from "@/common/util";
import { User, UserStatus } from "./types";

type UserData = {
  id: string; // UUID
  email: string | null;
  username: string;
  is_superuser: boolean;
  surname: string | null;
  name: string | null;
  patronym: string | null;
  status: UserStatus | null;
  birth_date: string | null;
  telephone_number: string | null;
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
  avatar: string | null; // URI
  characteristic: null | {
    experience: string | null;
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
    patronym: data.patronym,
    status: data.status ?? "На рабочем месте",
    dateOfBirth: data.birth_date,
    phoneNumber: data.telephone_number ?? "",
    workExperience: char?.experience ?? null,
    about: char?.about ?? "",
    skills: char?.competences[0]?.name ?? null,
    photo: data.avatar ?? null,
    position: data.job_title ?? "",
    serviceRank: data.class_rank ?? "",
    bossId: data.chief,
    unit: unit
      ? {
          id: unit.id,
          name: unit.name,
          parentId: unit.parent_structural_subdivision,
        }
      : null,
    organization: data.organization || null,
    avgRating: data.average_rating,
    career:
      char?.careers.map((c) => ({
        position: c.name,
        year_start: c.year_start,
        month_start: c.month_start,
        year_leave: c.year_finish,
        month_leave: c.month_finish,
      })) || [],
    training:
      char?.trainings.map((t) => ({
        name: t.name,
        attachment: t.file ?? null,
      })) || [],
    education:
      char?.universitys.map((u) => ({
        year: u.year ?? 0,
        university: u.name,
        major: u.faculty ?? "",
      })) || [],
    courses:
      char?.courses.map((c) => ({
        year: c.year ?? 0,
        name: c.name,
        attachment: c.file ?? null,
      })) || [],
    communityWork:
      char?.volunteers.map(({ name, file }) => ({
        name,
        attachment: file ?? null,
      })) || [],
    awards:
      char?.rewards.map(({ name, file }) => ({
        name,
        attachment: file ?? null,
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
  patronym: user.patronym,
  status: user.status,
  birth_date: user.dateOfBirth,
  telephone_number: user.phoneNumber,
  job_title: user.position,
  class_rank: user.serviceRank,
  chief: user.bossId,
  structural_division: user.unit && {
    id: user.unit.id,
    name: user.unit.name,
    parent_structural_subdivision: user.unit.parentId,
  },
  organization: user.organization,
  average_rating: user.avgRating,
  avatar: user.photo,
  characteristic: {
    experience: user.workExperience,
    about: user.about,
    competences: user.skills === null ? [] : [{ name: user.skills }],
    careers: user.career.map((c) => ({
      name: c.position,
      year_start: c.year_start,
      month_start: c.month_start,
      year_finish: c.year_leave,
      month_finish: c.month_leave,
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
      file: c.attachment ?? undefined,
    })),
    rewards: user.awards.map((a) => ({
      name: a.name,
      file: a.attachment ?? undefined,
    })),
    trainings: user.training.map((t) => ({
      name: t.name,
      file: t.attachment ?? undefined,
    })),
    volunteers: user.communityWork.map(({ name, attachment: image }) => ({
      name,
      file: image ?? undefined,
    })),
  },
});

export const useFetchUsers = (orgId: number | null) => {
  const tokenFetcher = useTokenFetcher();

  return useSWR(
    orgId === null
      ? `/colleagues/`
      : `/colleagues/?structural_division__organization__id=${orgId}`,
    async (path: string) =>
      tokenFetcher(path)
        .then((res) => res.json())
        .then((usersData: UserData[]) => usersData.map(toUser))
        .then((users: User[]) => new Map(users.map((user) => [user.id, user]))),
    {
      keepPreviousData: false,
    },
  );
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
    const bossTree = user.bossId === null ? undefined : trees.get(user.bossId);
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
  const s1 = useFetchUsersSubset({ unitId: user.unit?.id });
  const s2 = useFetchUsersSubset({ bossId: user.id });
  const s = [...(s1?.data || []), ...(s2?.data || [])];
  if (s.length === 0) return;
  s.sort(cmpUsers);
  return new Map(s.map((user) => [user.id, user]));
};

export const useFetchUser = (userId?: string | null) => {
  const tokenFetcher = useTokenFetcher();

  const { data, ...rest } = useSWR<User>(
    userId ? `/colleagues/${userId}/` : null,
    async (path: string) =>
      tokenFetcher(path)
        .then((data) => data.json())
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
  if (!uri?.startsWith("blob:")) {
    return uri ?? undefined;
  }
  const ext = fileExtention(uri);
  if (!ext) {
    return;
  }
  uri = trimExtention(uri);
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

export const saveUser = async (token: string, user: User) => {
  const data = fromUser(user);

  const attrs = [
    ["courses", "courses"],
    ["training", "trainings"],
    ["awards", "rewards"],
    ["communityWork", "volunteers"],
  ] as const;

  await Promise.all([
    uploadFile(token, user.photo).then((file) => {
      data.avatar = file ?? null;
    }),
    ...attrs.flatMap(([attr, apiAttr]) =>
      (user[attr] || []).map(({ attachment }, i) =>
        uploadFile(token, attachment)
          .then((file) => {
            if (data.characteristic) {
              data.characteristic[apiAttr][i].file = file;
            }
          })
          .catch(console.error),
      ),
    ),
  ]);

  return tokenFetch(token, `/colleagues/${user.id}/`, {
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
      mutate(`/colleagues/${user.id}/`, user, opt);
      mutate(`/colleagues/me/`, user, opt);
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
