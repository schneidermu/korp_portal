import useSWR, { mutate } from "swr";

import { User, UserStatus } from "../types";

import { tokenFetch, useTokenFetcher } from "../auth/slice";

import { produce } from "immer";
import { fullNameLong } from "../util";

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
  structural_division: null | { id: number; name: string };
  organization: null | { id: number; name: string };
  average_rating: number | null;
  avatar: string | null; // URI
  characteristic: null | {
    experience: number | null;
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
      file: string | null; // URI
    }[];
    courses: {
      name: string;
      year: number | null;
      month: number | null;
      file: string | null; // URI
    }[];
    rewards: {
      name: string;
      file: string | null; // URI
    }[];
    trainings: {
      name: string;
      file: string | null; // URI
    }[];
  };
};

const toUser = (data: UserData): User => {
  const char = data.characteristic;
  return {
    id: data.id,
    email: data.username + "@voda.gov.ru",
    username: data.username,
    isAdmin: data.is_superuser,
    lastName: data.surname || "?",
    firstName: data.name || "?",
    patronym: data.patronym,
    status: data.status || "На рабочем месте",
    dateOfBirth: data.birth_date,
    phoneNumber: data.telephone_number || "",
    workExperience: char?.experience || null,
    about: char?.about || "",
    skills: char?.competences[0]?.name || "",
    photo: data.avatar,
    position: data.job_title || "",
    serviceRank: data.class_rank || "",
    bossId: data.chief,
    unit: data.structural_division,
    organization: data.organization,
    career:
      char?.careers.map((c) => ({
        position: c.name,
        year_start: c.year_start,
        month_start: c.month_start,
        year_leave: c.year_finish,
        month_leave: c.month_finish,
      })) || [],
    training:
      char?.trainings.map((t) => ({ name: t.name, attachment: t.file })) || [],
    education:
      char?.universitys.map((u) => ({
        year: u.year || 9999,
        university: u.name,
        major: u.faculty || "?",
      })) || [],
    courses:
      char?.courses.map((c) => ({
        year: c.year || 9999,
        name: c.name,
        attachment: c.file,
      })) || [],
    communityWork: [],
    awards:
      char?.rewards.map((r) => ({ title: r.name, image: r.file || "" })) || [],
  };
};

const fromUser = (user: User): UserData => {
  return {
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
    structural_division: user.unit,
    organization: user.organization,
    average_rating: null,
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
        file: null,
      })),
      courses: user.courses.map((c) => ({
        name: c.name,
        year: c.year,
        month: null,
        file: c.attachment,
      })),
      rewards: user.awards.map((a) => ({
        name: a.title,
        file: a.image,
      })),
      trainings: user.training.map((t) => ({
        name: t.name,
        file: t.attachment,
      })),
    },
  };
};

export const useFetchUsers = () => {
  const tokenFetcher = useTokenFetcher();

  return useSWR("/colleagues/", async (path: string) =>
    tokenFetcher(path)
      .then((res) => res.json())
      .then((usersData: UserData[]) => usersData.map(toUser))
      .then((users: User[]) => new Map(users.map((user) => [user.id, user]))),
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
  // TODO: return {data: undefined}

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

export const useFetchUser = (userId: string | null) => {
  const tokenFetcher = useTokenFetcher();

  const { data, ...rest } = useSWR<User>(
    userId === null ? null : `/colleagues/${userId}/`,
    async (path: string) =>
      tokenFetcher(path)
        .then((data) => data.json())
        .then((data) => {
          console.log("user data", { path, data });
          return toUser(data);
        }),
  );

  return {
    user: data,
    ...rest,
  };
};

type Partial2<T> = {
  [P in keyof T]?: T[P] extends object ? Partial<T[P]> : T[P];
};

export const updateUser = async (
  token: string,
  userId: string,
  diff: Partial<User>,
) => {
  const data: Partial<UserData> = {
    status: diff.status,
    birth_date: diff.dateOfBirth,
    telephone_number: diff.phoneNumber,
    email: diff.email,
    job_title: diff.position,
    class_rank: diff.serviceRank,
    structural_division: diff.unit,
    organization: diff.organization,
  };
  return tokenFetch(token, `/colleagues/${userId}/`, {
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
      console.log({ userData });
      return mutate(
        `/colleagues/`,
        (users: Map<string, User> | undefined) => {
          console.log("users are", { users });
          if (users === undefined) return undefined;
          console.log("here");
          const user = toUser(userData);
          console.log("user is", { user });
          return produce(users, (draft) => {
            console.log("set to", { user });
            draft.set(user.id, user);
          });
        },
        { revalidate: false },
      );
    });
};
