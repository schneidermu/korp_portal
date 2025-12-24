import useSWR from "swr";

import { useTokenFetcher } from "@api/auth";

import { SkillCompletion, SkillCompletionRaw } from "./types";

export const useSkillsCompletion = ({
  minUsage = 0,
}: {
  minUsage?: number;
}) => {
  const tokenFetcher = useTokenFetcher();

  const key = `/competences/?min_characteristic_count=${minUsage}`;

  return useSWR<SkillCompletion[]>(key, () =>
    tokenFetcher(key)
      .then((res) => res.json())
      .then((data: SkillCompletionRaw[]) =>
        data.map((d) => ({
          id: d.id,
          name: d.name,
          usage: d.characteristic_count,
          isImportant: d.is_important,
        })),
      ),
  );
};
