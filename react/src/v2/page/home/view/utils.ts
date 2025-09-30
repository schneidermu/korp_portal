import { Temporal } from "temporal-polyfill";

export const formatDate = (date: string) => {
  return Temporal.PlainDateTime.from(date.slice(0, -1))
    .toPlainDate()
    .toLocaleString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      weekday: "short",
    });
};
