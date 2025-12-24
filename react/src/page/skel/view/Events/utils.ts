import { Temporal } from "temporal-polyfill";

import * as R from "radashi";

import { User } from "@api/user/types";

export const WEEKDAYS_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

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

export const monthDays = (
  date: Temporal.PlainDate,
): {
  day: number;
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  isToday: boolean;
}[] => {
  const now = Temporal.Now.plainDateISO();

  const firstDay = date.with({ day: 1 });
  const firstMonday = firstDay.subtract({ days: firstDay.dayOfWeek - 1 });

  const lastDay = date.with({ day: date.daysInMonth });
  const lastSunday = lastDay.add({ days: 7 - lastDay.dayOfWeek });

  const days: ReturnType<typeof monthDays> = [];

  for (
    let d = firstMonday;
    Temporal.PlainDate.compare(d, lastSunday) <= 0;
    d = d.add({ days: 1 })
  ) {
    days.push({
      day: d.day,
      isCurrentMonth: d.month === date.month,
      isCurrentDay: d.month === date.month && d.day === date.day,
      isToday: d.month === now.month && d.day === now.day,
    });
  }

  return days;
};

export const birthdays = ({
  users,
  date,
}: {
  users: { [key: string]: User };
  date: Temporal.PlainDate;
}) => {
  const monday = date.subtract({ days: date.dayOfWeek - 1 });
  const sunday = date.add({ days: 7 - date.dayOfWeek });

  const bdayUsers: [Temporal.PlainDate, User][] = [];

  for (const user of Object.values(users)) {
    if (!user.dateOfBirth) continue;
    for (let y = monday.year; y <= sunday.year; y++) {
      const bday = Temporal.PlainDate.from(user.dateOfBirth).with({
        year: y,
      });
      if (
        Temporal.PlainDate.compare(monday, bday) <= 0 &&
        Temporal.PlainDate.compare(bday, sunday) <= 0
      ) {
        bdayUsers.push([bday, user]);
      }
    }
  }

  return R.alphabetical(bdayUsers, ([d]) => d.toString());
};
