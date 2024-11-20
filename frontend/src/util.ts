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
