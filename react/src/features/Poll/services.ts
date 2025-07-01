import useSWR from "swr";

import { useTokenFetcher } from "@/features/auth/hooks.ts";

import { Poll, toPoll } from "./types.ts";
import { useAuth } from "@/features/auth/slice.ts";
import { APIError } from "@/shared/utils/error.ts";

export const useFetchPoll = (id: number | null) => {
  const fetcher = useTokenFetcher();

  return useSWR<Poll>(id === null ? null : `/polls/${id}/`, (key: string) =>
    fetcher(key)
      .then((res) => {
        if (res.status !== 200) {
          throw new APIError(`fetching poll ${id}`, res);
        }
        return res.json();
      })
      .then(toPoll),
  );
};

interface RawAnswer {
  question_id: number;
  custom_choice_text: string;
  selected_choices: { id: number }[];
}

export interface RawUserAnswers {
  submitted_at: string;
  user: { id: string };
  answers: RawAnswer[];
}

export interface UserAnswer {
  qid: number;
  freeChoice: string;
  choices: number[];
}

export interface UserAnswers {
  answers: UserAnswer[];
  submittedAt: Date | undefined;
}

export const useFetchAnswers = (pollId: number | null, userId?: string) => {
  const auth = useAuth();
  const fetcher = useTokenFetcher();

  userId ??= auth.userId;

  const key = pollId === null ? null : `/polls/${pollId}/answers/${userId}/`;

  return useSWR<UserAnswers | null>(key, async (path: string) => {
    const res = await fetcher(path);
    if (res.status !== 200 && res.status !== 404) {
      throw new APIError(
        `fetching poll ${pollId} answers for user ${userId}`,
        res,
      );
    }
    if (res.status === 404) return { answers: [], submittedAt: undefined };
    const { submission_details: raw }: { submission_details: RawUserAnswers } =
      await res.json();
    console.log(raw);
    const answers = raw.answers.map((answer) => ({
      qid: answer.question_id,
      freeChoice: answer.custom_choice_text,
      choices: answer.selected_choices.map(({ id }) => id),
    }));
    return {
      answers,
      submittedAt: new Date(raw.submitted_at),
    };
  });
};
