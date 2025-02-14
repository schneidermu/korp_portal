import { LOCALE, STATIC_BASE_URL } from "@/app/const";

import { User } from "@/user/types";

import personIcon from "@/assets/person.svg";

export const urlBasename = (url: string): string => {
  const parts = decodeURI(url).split("/");
  return parts[parts.length - 1];
};

export const fileExtention = (url: string): string | undefined => {
  const parts = decodeURI(url).split(".");
  if (parts.length < 2) {
    return;
  }
  return parts[parts.length - 1].toLowerCase();
};

export const trimExtention = (path: string) => {
  const parts = path.split(".");
  if (parts.length < 2) {
    return path;
  }
  return parts.slice(0, -1).join(".");
};

const nameParts = (user: User): string[] => {
  const parts = [user.lastName, user.firstName];
  if (user.patronym !== null) {
    parts.push(user.patronym);
  }
  return parts;
};

export const fullNameShort = (user: User): string => {
  const parts = nameParts(user);
  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i][0] + ".";
  }
  return parts.join(" ");
};

export const fullNameLong = (user: User): string => {
  return nameParts(user).join(" ");
};

export type MonomorphFields<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

export const formatDateOfBirth = new Intl.DateTimeFormat(LOCALE, {
  year: "numeric",
  month: "short",
  day: "numeric",
}).format;

export const formatDateLong = new Intl.DateTimeFormat(LOCALE, {
  year: "numeric",
  month: "long",
  day: "numeric",
}).format;

export const fullImagePath = (path: string) => {
  if (path.startsWith("/media")) {
    return STATIC_BASE_URL + path;
  }
  if (path.startsWith("blob:")) {
    return path.replace(/\.[a-z0-9]+$/, "");
  }
  return path;
};

export const userPhotoPath = (user: User) =>
  user.photo ? fullImagePath(user.photo) : personIcon;

export const noop = () => ({});

const formatMobilePhoneProper = (phone: string): string => {
  const p1 = phone.slice(0, 3);
  const p2 = phone.slice(3, 6);
  const p3 = phone.slice(6, 8);
  const p4 = phone.slice(8, 10);
  return `(${p1}) ${p2}-${p3}-${p4}`;
};

export const formatMobilePhone = (phone: string): string => {
  if (phone.length === 12 && phone.startsWith("+7")) {
    return `+7 ${formatMobilePhoneProper(phone.slice(2))}`;
  }
  if (phone.length === 11 && phone.startsWith("8")) {
    return `8 ${formatMobilePhoneProper(phone.slice(1))}`;
  }
  return phone;
};

export const stripPhoneNumber = (phone: string): string => {
  return phone.replace(/[ ()-]/g, "");
};
