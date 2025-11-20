import * as R from "radashi";

export const USER_STATUS = [
  "В командировке",
  "В отпуске",
  "На больничном",
  "На рабочем месте",
  "Нет на месте",
] as const;

export type UserStatus = (typeof USER_STATUS)[number];

export type Unit = {
  id: number;
  name: string;
  parentId: number | null;
};

export type User = {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  lastName: string;
  firstName: string;
  patronym: string | null;
  sex: "male" | "female" | null;
  status: UserStatus;
  dateOfBirth: string | null;
  phoneNumber: string;
  innerPhoneNumber: string;
  office: string;
  workExperience: string;
  about: string;
  skills: string[];
  photo: string | null;
  position: string;
  serviceRank: string;
  bossId: string | null;
  unit: Unit | null;
  organization: { id: number; name: string } | null;
  avgRating: number | null;
  myRating: number | null;
  numRates: number;
  agreeDataProcessing: boolean;
  career: {
    position: string;
    year_start: number;
    month_start: number | null;
    year_leave: number | null;
    month_leave: number | null;
  }[];
  training: {
    year: number;
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

export type UserRaw = {
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
  structural_division: null | {
    id: number;
    name: string;
    parent_structural_subdivision: number | null;
  };
  organization: null | { id: number; name: string };
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
      year: number | null;
      file: string | null; // URI
    }[];
    volunteers: {
      name: string;
      file: string | null;
    }[];
  };
};

export const toUser = (r: UserRaw): User => {
  const c = r.characteristic;
  const unit = r.structural_division;

  return {
    ...R.pick(r, ["id", "username", "patronym", "organization"]),
    email: r.username,
    isAdmin: r.is_superuser,
    lastName: r.surname ?? "?",
    firstName: r.name ?? "?",
    sex: r.sex === "Мужской" ? "male" : r.sex === "Женский" ? "female" : null,
    status: r.status ?? "На рабочем месте",
    dateOfBirth: r.birth_date,
    phoneNumber: r.telephone_number ?? "",
    innerPhoneNumber: r.inner_telephone_number ?? "",
    office: r.office ?? "",
    workExperience: c?.experience ?? "",
    about: c?.about ?? "",
    skills: R.alphabetical(
      c?.competences.map(({ name }) => name) ?? [],
      (x) => x,
    ),
    photo: r.avatar,
    position: r.job_title ?? "",
    serviceRank: r.class_rank ?? "",
    bossId: r.chief,
    unit: unit && {
      ...R.pick(unit, ["id", "name"]),
      parentId: unit.parent_structural_subdivision,
    },
    avgRating: r.average_rating,
    myRating: r.rated_by_me,
    numRates: r.num_rates,
    agreeDataProcessing: r.agreed_with_data_processing,
    career:
      c?.careers.map((c) => ({
        position: c.name,
        year_start: c.year_start,
        month_start: c.month_start,
        year_leave: c.year_finish,
        month_leave: c.month_finish,
      })) ?? [],
    training:
      c?.trainings.map((t) => ({
        year: t.year ?? 0,
        name: t.name,
        attachment: t.file,
      })) ?? [],
    education:
      c?.universitys.map((u) => ({
        year: u.year ?? 0,
        university: u.name,
        major: u.faculty ?? "",
      })) ?? [],
    courses:
      c?.courses.map(({ name, file, year }) => ({
        year: year ?? 0,
        name: name,
        attachment: file,
      })) ?? [],
    communityWork:
      c?.volunteers.map(({ name, file }) => ({
        name,
        attachment: file,
      })) ?? [],
    awards:
      c?.rewards.map(({ name, file }) => ({
        name,
        attachment: file,
      })) ?? [],
  };
};

export const fromUser = (u: User): UserRaw => ({
  ...R.pick(u, ["id", "email", "username", "patronym", "organization"]),
  is_superuser: u.isAdmin,
  surname: u.lastName,
  name: u.firstName,
  sex: u.sex === "male" ? "Мужской" : u.sex === "female" ? "Женский" : null,
  status: u.status,
  birth_date: u.dateOfBirth,
  telephone_number: u.phoneNumber,
  inner_telephone_number: u.innerPhoneNumber,
  office: u.office,
  job_title: u.position,
  class_rank: u.serviceRank,
  chief: u.bossId,
  structural_division: u.unit && {
    ...R.pick(u.unit, ["id", "name"]),
    parent_structural_subdivision: u.unit.parentId,
  },
  average_rating: u.avgRating,
  rated_by_me: u.myRating,
  num_rates: u.numRates,
  avatar: u.photo,
  agreed_with_data_processing: u.agreeDataProcessing,
  characteristic: {
    experience: u.workExperience ?? "",
    about: u.about,
    competences: u.skills.map((name) => ({ name })),
    careers: u.career.map((c) => ({
      name: c.position,
      year_start: c.year_start,
      month_start: c.month_start,
      year_finish: c.year_leave,
      month_finish: c.month_leave,
    })),
    universitys: u.education.map((e) => ({
      name: e.university,
      faculty: e.major,
      year: e.year,
      month: null,
      file: null,
    })),
    courses: u.courses.map((c) => ({
      name: c.name,
      year: c.year,
      month: null,
      file: c.attachment,
    })),
    rewards: u.awards.map((a) => ({
      name: a.name,
      file: a.attachment,
    })),
    trainings: u.training.map((t) => ({
      name: t.name,
      year: t.year,
      file: t.attachment,
    })),
    volunteers: u.communityWork.map(({ name, attachment }) => ({
      name,
      file: attachment,
    })),
  },
});
