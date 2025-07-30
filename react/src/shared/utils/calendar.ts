export const MONTHS = [
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

export const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

export const monthDays = (
  year: number,
  month: number,
): { day?: number; isNow?: boolean }[] => {
  const now = new Date();
  const monthIsNow = year === now.getFullYear() && month === now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const skipDays = new Date(year, month, 0).getDay();

  const days: ReturnType<typeof monthDays> = [];
  for (let i = 0; i < skipDays; i++) {
    days.push({});
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ day, isNow: monthIsNow && day === now.getDate() });
  }

  return days;
};
