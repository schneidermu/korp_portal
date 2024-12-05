import { LOCALE } from "./const";
import { User } from "./types";

export function urlBasename(url: string): string {
  const parts = decodeURI(url).split("/");
  return parts[parts.length - 1];
}

function nameParts(user: User): string[] {
  const parts = [user.lastName, user.firstName];
  if (user.patronym !== null) {
    parts.push(user.patronym);
  }
  return parts;
}

export function fullNameShort(user: User): string {
  const parts = nameParts(user);
  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i][0] + ".";
  }
  return parts.join(" ");
}

export function fullNameLong(user: User): string {
  return nameParts(user).join(" ");
}

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
