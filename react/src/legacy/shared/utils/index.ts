import { Option as O } from "effect";

import { BACKEND_PREFIX, LOCALE } from "@app/const";

import { User } from "@legacy/features/user/types";

import maleAvatar from "/avatar/male.png";
import femaleAvatar from "/avatar/female.png";

export const NBSP = "\xA0";

export const sorted = <T>(xs: T[], compareFn?: (a: T, b: T) => number) => {
  const ys = [...xs];
  ys.sort(compareFn);
  return ys;
};

export const urlBasename = (url: string): string => {
  const parts = decodeURI(url).split("/");
  return parts[parts.length - 1];
};

export const fileExtension = (url: string): string | undefined => {
  const parts = decodeURI(url).split(".");
  if (parts.length < 2) {
    return;
  }
  return parts[parts.length - 1].toLowerCase();
};

export const trimExtension = (path: string) => {
  const parts = path.split(".");
  if (parts.length < 2) {
    return path;
  }
  return parts.slice(0, -1).join(".");
};

const nameParts = (user: User): string[] => {
  const parts = [user.lastName, user.firstName];
  if (O.isSome(user.patronym)) {
    parts.push(user.patronym.value);
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

export const formatDateFuller = (date: Date) =>
  new Intl.DateTimeFormat(LOCALE, {
    weekday: "short",
    year: "numeric",
    month: "long",
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

export const formatDatePretty = new Intl.DateTimeFormat(LOCALE, {
  month: "long",
  day: "numeric",
}).format;

export const formatDateNumeric = new Intl.DateTimeFormat(LOCALE, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format;

export const resolveMediaPath = (path: string) => {
  if (path.startsWith("data:")) {
    return path;
  }
  if (path.startsWith("blob:")) {
    return path.replace(/\.[a-z0-9]+$/, "");
  }
  try {
    path = new URL(path).pathname;
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
  }
  if (path.startsWith("/media")) {
    return BACKEND_PREFIX + path;
  }
  return path;
};

export const userPhotoPath = (user: User) =>
  O.match(user.photo, {
    onSome: resolveMediaPath,
    onNone: () => (user.sex === "female" ? femaleAvatar : maleAvatar),
  });

export const noop = () => ({});

const formatMobilePhoneProper = (phone: string): string => {
  const p1 = phone.slice(0, 3);
  const p2 = phone.slice(3, 6);
  const p3 = phone.slice(6, 8);
  const p4 = phone.slice(8, 10);
  return `(${p1}) ${p2}-${p3}-${p4}`;
};

export const formatMobilePhone = (rawPhone: string): string => {
  const phone = rawPhone.replace(/[- ()]/g, "");
  if (phone.length === 12 && phone.startsWith("+7")) {
    return `+7 ${formatMobilePhoneProper(phone.slice(2))}`;
  }
  if (phone.length === 11 && phone.startsWith("8")) {
    return `8 ${formatMobilePhoneProper(phone.slice(1))}`;
  }
  return rawPhone;
};

export const stripPhoneNumber = (phone: string): string => {
  return phone.replace(/[ ()-]/g, "");
};

export const toNumberOption = (s: string): O.Option<number> => {
  s = s.replace(/[^0-9]/g, "");
  return O.fromNullable(s ? Number(s) : null);
};

export const toNumber = (s: string): number =>
  O.getOrElse(toNumberOption(s), () => 0);

export const index = <T>(xs: T[], i: number): T => {
  if (i < 0) i += xs.length;
  return xs[i];
};

export const indexSafe = <T>(xs: T[], i: number): T | undefined => index(xs, i);

export const max = (xs: number[]) => xs.reduce((max, x) => (x > max ? x : max));

export const remove = <T>(xs: T[], x0: T) => xs.filter((x) => x !== x0);

export const round = (x: number, n: number = 0) =>
  Math.round(x * 10 ** n) / 10 ** n;

export const normPercents = (xs: number[], n: number = 0) => {
  let over = 0;
  const k = 10 ** n;
  xs.forEach((x, i) => {
    const f =
      Math.abs(over) < k ? Math.round : over > 0 ? Math.floor : Math.ceil;
    const y = f(x * k) / k;
    over += y - x;
    xs[i] = y;
  });
  for (let i = 0; i < xs.length; i++) {
    if (over < k) break;
    if (xs[i] === 0) continue;
    if (over > 0) {
      xs[i] -= k;
      over -= k;
    } else {
      xs[i] += k;
      over += k;
    }
  }
  return xs;
};

export const downloadResponse = async (res: Response, name: string) => {
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
};
