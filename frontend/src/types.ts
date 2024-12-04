export const USER_STATUS = [
  "В командировке",
  "В отпуске",
  "На больничном",
  "На рабочем месте",
  "Нет на месте",
] as const;

export type UserStatus = (typeof USER_STATUS)[number];

export type User = {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  lastName: string;
  firstName: string;
  patronym: string | null;
  status: UserStatus;
  dateOfBirth: string | null;
  phoneNumber: string;
  workExperience: number | null;
  about: string;
  skills: string;
  photo: string | null;
  position: string;
  serviceRank: string;
  bossId: string | null;
  unit: null | { id: number; name: string };
  organization: null | { id: number; name: string };
  career: {
    position: string;
    year_start: number;
    month_start: number | null;
    year_leave: number | null;
    month_leave: number | null;
  }[];
  training: {
    name: string;
    attachment: string | null;
  }[];
  education: {
    year: number;
    university: string;
    major: string;
  }[];
  courses: {
    year: number;
    name: string;
    attachment: string | null;
  }[];
  communityWork: {
    name: string;
    picture: string;
  }[];
  awards: {
    title: string;
    image: string;
  }[];
};
