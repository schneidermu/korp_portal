import { useParams } from "react-router-dom";

export const useIntParam = (name: string): number | null => {
  const params = useParams();

  const value = params[name];
  if (value === null) return null;
  const num = Number(value);
  if (!Number.isSafeInteger(num)) return null;
  return num;
};
