import { tokenFetch } from "@/features/auth/hooks";
import { APIError } from "@api/common/errors";

import { index } from "@/shared/utils";
import { NewPoll, NewQuestion, PollRaw } from "../types";
import { mutate } from "swr";

const toQuestion = (q: NewQuestion, order: number) => {
  const cids =
    q.choices[index(q.cids, -1)] === "" ? q.cids.slice(0, -1) : q.cids;

  return {
    text: q.text,
    order,
    question_type: q.isMultipleChoice ? "multiple" : "single",
    is_require: q.isRequired,
    min_choices: q.minChoices,
    max_choices: q.maxChoices,
    allow_custom_answer: q.acceptFreeChoice,
    choices: cids.map((cid, i) => ({
      choice_text: q.choices[cid],
      order: i + 1,
    })),
  };
};

export const savePoll = async ({
  token,
  orgId,
  poll,
  qids,
  pollId,
}: {
  token: string;
  orgId: number | null;
  poll: NewPoll;
  qids: number[];
  pollId?: number;
}) => {
  const payload = {
    name: poll.name,
    description: poll.description,
    poll_group: poll.groupId,
    status: "draft",
    kind: "plain",
    organization: orgId !== null ? [orgId] : [],
    is_public: poll.isPublic,
    is_anonymous: poll.isAnonymous,
    questions: qids
      .map((qid) => poll.questions[qid])
      .map((q, i) => toQuestion(q, i + 1)),
  };

  const key = pollId === undefined ? `/polls/` : `/polls/${pollId}/`;
  const method = pollId === undefined ? "POST" : "PUT";

  const res = await tokenFetch(token, key, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new APIError(`saving poll`, res);
  }

  if (pollId !== undefined) {
    mutate(`/polls/${pollId}/`);
  }

  return res;
};

export const publishPoll = async ({
  token,
  pollId,
}: {
  token: string;
  pollId: number;
}) => {
  const payload: Partial<PollRaw> = {
    status: "published",
    pub_date: new Date().toISOString(),
  };

  const key = `/polls/${pollId}/`;

  const res = await tokenFetch(token, key, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new APIError(`publishing poll`, res);
  }

  mutate(`/polls/${pollId}/`);

  return res;
};
