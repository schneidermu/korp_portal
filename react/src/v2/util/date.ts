import { Temporal } from "temporal-polyfill";

export const parseAPIDate = (date: string): Temporal.PlainDate =>
  Temporal.PlainDateTime.from(date.slice(0, -1)).toPlainDate();

export const formatDate = (
  date: Temporal.PlainDate,
  opts: Intl.DateTimeFormatOptions = {},
) =>
  date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...opts,
  });
