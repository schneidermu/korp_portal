import useSWR from "swr";

import { tokenFetch, useTokenFetcher } from "@api/auth";
import { useAuth } from "@api/auth";
import { APIError } from "@api/common/errors";

import { Answers, Poll } from "../types";

export interface RawAnswer {
  question_id: number;
  custom_choice_text: string | null;
  free_text_answer: string | null;
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
  userId: string;
  submittedAt: Date | undefined;
  answers: UserAnswer[];
}

export const toUserAnswers = (raw: RawUserAnswers): UserAnswers => {
  const answers = raw.answers.map((answer) => ({
    qid: answer.question_id,
    freeChoice: (answer.custom_choice_text || answer.free_text_answer) ?? "",
    choices: answer.selected_choices.map(({ id }) => id),
  }));

  return {
    userId: raw.user.id,
    submittedAt: new Date(raw.submitted_at),
    answers,
  };
};

export const submitPoll = async ({
  token,
  poll,
  answers,
}: {
  token: string;
  poll: Poll;
  answers: Answers;
}) => {
  const payload = {
    poll: poll.id,
    answers: Object.entries(answers).map(([questionId, ans]) => {
      const q = poll.questions.find((q) => q.id.toString() === questionId);

      const a: {
        question_id: number;
        selected_choice_ids: number[];
        custom_choice_text?: string;
        free_text_answer?: string;
      } = {
        question_id: Number(questionId),
        selected_choice_ids: ans.choices,
      };

      if (ans.freeChoice) {
        if (q?.kind === "text") a.custom_choice_text = ans.freeChoice;
        else a.free_text_answer = ans.freeChoice;
      }

      return a;
    }),
  };

  const res = await tokenFetch(token, `/polls/${poll.id}/submit_answers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status !== 201) {
    throw new APIError(`submitting answers for poll ${poll.id}`, res);
  }

  return res;
};

export const useFetchSubmittedUserIds = (pollId: number | null) => {
  const fetcher = useTokenFetcher();

  const key = pollId === null ? null : `/polls/${pollId}/answers/`;

  return useSWR<string[]>(key, (path: string) =>
    fetcher(path)
      .then((res) => res.json())
      .then(({ results }: { results: { user: { id: string } }[] }) =>
        results.map(({ user }) => user.id),
      ),
  );
};

export const useFetchUserAnswers = (pollId: number | null, userId?: string) => {
  const auth = useAuth();
  const fetcher = useTokenFetcher();

  userId ??= auth.userId;

  const key = pollId === null ? null : `/polls/${pollId}/answers/${userId}/`;

  return useSWR<UserAnswers>(key, async (path: string) => {
    const res = await fetcher(path);
    if (res.status !== 200 && res.status !== 404) {
      throw new APIError(
        `fetching poll ${pollId} answers for user ${userId}`,
        res,
      );
    }
    if (res.status === 404)
      return { userId: "", answers: [], submittedAt: undefined };
    const { submission_details: raw }: { submission_details: RawUserAnswers } =
      await res.json();
    return toUserAnswers(raw);
  });
};
