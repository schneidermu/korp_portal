import { WritableDraft } from "immer";

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
  workExperience: string | null;
  about: string;
  skills: string;
  photo: string | null;
  position: string;
  serviceRank: string;
  bossId: string | null;
  unit: null | { id: number; name: string };
  organization: null | { id: number; name: string };
  avgRating: number | null;
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
    attachment: string | null;
  }[];
  awards: {
    name: string;
    attachment: string | null;
  }[];
};

export type UpdateUserFn = (
  recipe: User | ((draft: WritableDraft<User>) => void),
) => void;

export const userBlobURLs = (user: User): Set<string> => {
  const set = new Set<string>();

  const f = ({ attachment }: { attachment: string | null }) => {
    if (attachment?.startsWith("blob:")) {
      set.add(attachment);
    }
  };

  user.awards.forEach(f);
  user.communityWork.forEach(f);
  user.courses.forEach(f);
  user.training.forEach(f);

  f({ attachment: user.photo });

  return set;
};
