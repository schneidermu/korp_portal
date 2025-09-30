import { Temporal } from "temporal-polyfill";

export const formatDate = (date: Temporal.PlainDate) => {
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
  });
};
