import useSWR from "swr";

import { User } from "../types";

import { urlBasename } from "../util";
import { useTokenFetcher } from "../auth/slice";

type UserInfo = {
  average_rating: number;
  birth_date: string;
  class_rank: string;
  email: string;
  fio: string;
  id: string;
  job_title: string;
  organization: string;
  status: string;
  structural_division: string;
  supervizor: { id: string };
  team: { id: string }[];
  telephone_number: string;
  username: string;
  characteristic: {
    about: string;
    avatar: string;
    careers: {
      id: number;
      date_start: string;
      date_finish?: string;
      name: string;
    }[];
    competences: {
      id: number;
      name: string;
    }[];
    courses: {
      date: string;
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
      date: string;
      file: string;
      id: number;
      name: string;
    }[];
  };
};

const transformUser = (info: UserInfo): User => {
  const [lastName, firstName, patronym] = info.fio.split(" ");
  let user: User = {
    id: info.id,
    username: info.username,
    lastName,
    firstName,
    patronym,
    email: info.email,
    status: info.status,
    dateOfBirth: info.birth_date,
    phone: info.telephone_number,
    position: info.job_title,
    serviceRank: info.class_rank,
    structuralUnit: info.structural_division,
    territorialBody: "N/A",
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
    bosses: [info.supervizor.id],
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
      const d1 = career.date_start.slice(0, 4);
      const d2 = career.date_finish?.slice(0, 4) || "н. вр.";
      return {
        period: `${d1} — ${d2}`,
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
      year: Number(uni.date.slice(0, 4)),
      university: uni.name,
      major: "N/A",
    })),
    courses: char.courses.map((course) => ({
      year: Number(course.date.slice(0, 4)),
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
