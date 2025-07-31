import { Temporal } from "temporal-polyfill";

export const MONTHS_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const WEEKDAYS_NAMES = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export const monthDays = (
  year: number,
  month: number,
): { day?: number; isNow?: boolean }[] => {
  const now = Temporal.Now.plainDateISO();
  const monthIsNow = year === now.year && month === now.month;
  const date = Temporal.PlainDate.from({ year, month, day: 1 });
  const daysInMonth = date.daysInMonth;
  const skipDays = (date.dayOfWeek + 7 - 1) % 7;

  const days: ReturnType<typeof monthDays> = [];
  for (let i = 0; i < skipDays; i++) {
    days.push({});
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ day, isNow: monthIsNow && day === now.day });
  }

  return days;
};
