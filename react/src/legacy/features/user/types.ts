import { WritableDraft } from "immer";

import { Option as O } from "effect";

import {
  formatDateLong,
  fullNameLong,
  fullNameShort,
  stripPhoneNumber,
} from "@legacy/shared/utils";
import { Temporal } from "temporal-polyfill";

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
  patronym: O.Option<string>;
  sex: "male" | "female" | null;
  status: UserStatus;
  dateOfBirth: O.Option<string>;
  phoneNumber: string;
  innerPhoneNumber: string;
  office: string;
  workExperience: O.Option<string>;
  about: string;
  skills: string[];
  photo: O.Option<string>;
  position: string;
  serviceRank: string;
  bossId: O.Option<string>;
  unit: O.Option<Unit>;
  organization: O.Option<{ id: number; name: string }>;
  avgRating: O.Option<number>;
  myRating: O.Option<number>;
  numRates: number;
  agreeDataProcessing: boolean;
  career: {
    position: string;
    year_start: number;
    month_start: O.Option<number>;
    year_leave: O.Option<number>;
    month_leave: O.Option<number>;
  }[];
  training: {
    year: number;
    name: string;
    attachment: O.Option<string>;
  }[];
  education: {
    year: number;
    university: string;
    major: string;
  }[];
  courses: {
    year: number;
    name: string;
    attachment: O.Option<string>;
  }[];
  communityWork: {
    name: string;
    attachment: O.Option<string>;
  }[];
  awards: {
    name: string;
    attachment: O.Option<string>;
  }[];
};

export type UpdateUserFn = (
  recipe: User | ((draft: WritableDraft<User>) => void),
) => void;

export const userBlobURLs = (user: User): Set<string> => {
  const set = new Set<string>();

  const f = ({ attachment }: { attachment: O.Option<string> }) => {
    if (O.exists(attachment, (s) => s.startsWith("blob:"))) {
      set.add(O.getOrThrow(attachment));
    }
  };

  user.awards.forEach(f);
  user.communityWork.forEach(f);
  user.courses.forEach(f);
  user.training.forEach(f);

  f({ attachment: user.photo });

  return set;
};

const matchString = (q: string, s: string | O.Option<string>): boolean => {
  const match = (s: string) => s.toLowerCase().includes(q);
  return typeof s === "string" ? match(s) : O.exists(s, match);
};

const matchDate = (term: string, date: Date): boolean => {
  term = term.replace(/^0/g, "");
  term = term.replace(/\.0/g, ".");

  const ds = [
    formatDateLong,
    (d: Date) => `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`,
    (d: Date) => `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear() % 100}`,
  ];

  return ds.some((f) => matchString(term, f(date)));
};

export const userAge = (user: User): number | undefined => {
  if (O.isNone(user.dateOfBirth)) {
    return;
  }

  const now = Temporal.Now.plainDateISO();
  const date = Temporal.PlainDate.from(user.dateOfBirth.value);

  return now.since(date).round({ smallestUnit: "years", relativeTo: now })
    .years;
};

type FilterFields = Set<keyof User>;

export const filterUsers = (
  users: User[],
  term: string,
  fields: FilterFields,
) => {
  term = term.toLowerCase();

  return users.filter((user) => {
    const {
      unit,
      organization,
      dateOfBirth,
      position,
      status,
      email,
      phoneNumber,
      serviceRank,
      innerPhoneNumber,
      office,
      skills,
    } = user;

    return (
      (fields.has("unit") &&
        O.isSome(unit) &&
        matchString(term, unit.value.name)) ||
      (fields.has("organization") &&
        O.isSome(organization) &&
        matchString(term, organization.value.name)) ||
      matchString(term, fullNameLong(user)) ||
      matchString(term, fullNameShort(user)) ||
      (fields.has("dateOfBirth") &&
        O.isSome(dateOfBirth) &&
        matchDate(term, new Date(dateOfBirth.value))) ||
      (fields.has("position") && matchString(term, position)) ||
      (fields.has("status") && matchString(term, status)) ||
      (fields.has("email") && matchString(term, email)) ||
      (fields.has("phoneNumber") &&
        matchString(stripPhoneNumber(term), phoneNumber)) ||
      (fields.has("serviceRank") && matchString(term, serviceRank)) ||
      (fields.has("innerPhoneNumber") &&
        matchString(
          term.replace("-", ""),
          innerPhoneNumber.replace("-", ""),
        )) ||
      (fields.has("office") &&
        matchString(term.replace(/к(аб?)?.?\s*/g, ""), office)) ||
      skills.some((skill) => matchString(term, skill))
    );
  });
};
