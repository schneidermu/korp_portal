import useSWR from "swr";

import { User } from "../types";

import { urlBasename } from "../util";
import { useTokenFetcher } from "../auth/slice";

type UserInfo = {
  average_rating: number;
  birth_date: string;
  chief: string | null;
  class_rank: string;
  email: string;
  surname: string;
  name: string;
  patronym: string | null;
  id: string;
  job_title: string;
  organization: string;
  status: string;
  structural_division: string;
  team: { id: string }[];
  telephone_number: string;
  username: string;
  characteristic: {
    about: string;
    avatar: string;
    careers: {
      id: number;
      year_start: number;
      year_finish?: number;
      name: string;
    }[];
    competences: {
      id: number;
      name: string;
    }[];
    courses: {
      year: number;
      file: string;
      id: number;
      name: string;
    }[];
    experience: number;
    rewards: {
      file: string;
      id: number;
      name: string;
    }[];
    trainings: {
      file: string;
      id: number;
      name: string;
    }[];
    universitys: {
      year: number;
      file: string;
      id: number;
      name: string;
      faculty: string;
    }[];
  };
};

const transformUser = (info: UserInfo): User => {
  let user: User = {
    id: info.id,
    username: info.username,
    lastName: info.surname,
    firstName: info.name,
    patronym: info.patronym,
    email: info.email,
    status: info.status,
    dateOfBirth: info.birth_date,
    phone: info.telephone_number,
    position: info.job_title,
    serviceRank: info.class_rank,
    structuralUnit: info.structural_division,
    territorialBody: info.organization,
    about: "",
    skills: "",
    career: [],
    workExperience: "",
    professionalDevelopments: [],
    photoURL: "",
    higherEducation: [],
    courses: [],
    communityWork: [],
    awards: [],
    colleagues: info.team.map(({ id }) => id),
    bosses: info.chief ? [info.chief] : [],
  };
  const char = info.characteristic;
  if (!char) {
    return user;
  }
  return {
    ...user,
    about: char.about,
    skills: char.competences[0]?.name || "",
    career: char.careers.map((career) => {
      return {
        period: `${career.year_start} — ${career.year_finish || "н. вр."}`,
        position: career.name,
      };
    }),
    // TODO: склонения
    workExperience: `${char.experience} лет`,
    professionalDevelopments: char.trainings.map((training) => ({
      name: training.name,
      certificate: urlBasename(training.file),
      certificateURL: training.file,
    })),
    photoURL: char.avatar,
    higherEducation: char.universitys.map((uni) => ({
      year: uni.year,
      university: uni.name,
      major: uni.faculty,
    })),
    courses: char.courses.map((course) => ({
      year: course.year,
      name: course.name,
      certificate: urlBasename(course.file),
      certificateURL: course.file,
    })),
    awards: char.rewards.map((award) => ({
      title: award.name,
      // TODO
      url: "/",
      pictureURL: award.file,
    })),
  };
};

export const useFetchUsers = () => {
  const tokenFetcher = useTokenFetcher();

  return useSWR("/colleagues/", async (path: string) =>
    tokenFetcher(path)
      .then((res) => res.json())
      .then((usersInfo) => {
        const users = new Map<string, User>();
        for (const info of usersInfo) {
          const user = transformUser(info);
          users.set(user.id, user);
        }
        return users;
      }),
  );
};

export const useFetchUser = (userId: string) => {
  const { data: users, isLoading, error } = useFetchUsers();

  if (error) throw error;

  const user = users?.get(userId) || null;

  console.log({ users, userId, user, error, isLoading });

  return { user, isLoading, error };
};
