export const ruOnNum = (
  n: number,
  s: {
    zero?: string;
    one?: string;
    x234?: string;
    other: string;
  },
) => {
  if (s.zero !== undefined && n === 0) return s.zero;
  // "Найден 1/21 человек" vs "Найдено 211 человек".
  if (s.one !== undefined && n % 10 === 1 && n % 100 !== 11) return s.one;
  // "Найдено 2/22 человека" vs "Найдено 112 человек".
  if (
    s.x234 !== undefined &&
    [2, 3, 4].includes(n % 10) &&
    ![12, 13, 14].includes(n % 100)
  )
    return s.x234;
  return s.other;
};
