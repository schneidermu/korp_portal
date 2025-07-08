import useSWR from "swr";

import { useTokenFetcher } from "@/features/auth/hooks.ts";
import { APIError } from "@/shared/utils/error.ts";

import { Poll, toPoll } from "../types.ts";
import { RawUserAnswers } from "../take/api.ts";

export const useFetchPolls = (kind = "plain") => {
  const fetcher = useTokenFetcher();

  return useSWR<Poll[]>(`/polls/?kind=${kind}`, (key: string) =>
    fetcher(key)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError("fetching polls", res);
        }
        return res.json();
      })
      .then((raw) => raw.map(toPoll)),
  );
};

export const useFetchAnswers = (pollId: number) => {
  const fetcher = useTokenFetcher();

  return useSWR(`/polls/${pollId}/answers/`, (key: string) =>
    fetcher(key)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError("fetching polls", res);
        }
        return res.json();
      })
      .then(({ results }: { results: RawUserAnswers[] }) => {
        const stats: { [key: number]: { [key: number]: number } } = {};
        for (const r of results) {
          for (const answer of r.answers) {
            const qid = answer.question_id;
            for (const c of answer.selected_choices) {
              if (!(qid in stats)) {
                stats[qid] = {};
              }
              if (!(c.id in stats[qid])) {
                stats[qid][c.id] = 0;
              }
              stats[qid][c.id]++;
            }
          }
        }
        return stats;
      }),
  );
};
