import { LOCALE, STATIC_BASE_URL } from "@/app/const";

import { User } from "@/user/types";

import personIcon from "/person.svg";

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

export const fullImagePath = (path: string) =>
  path.startsWith("/media") ? STATIC_BASE_URL + path : path;

export const userPhotoPath = (user: User) =>
  user.photo?.startsWith("/media")
    ? STATIC_BASE_URL + user.photo
    : user.photo || personIcon;

export const noop = () => ({});
