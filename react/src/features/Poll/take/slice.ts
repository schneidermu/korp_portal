import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState, useAppSelector } from "@/app/store";

import { Answers, Poll, Question } from "../types.ts";
import { questionIsShown, validateQuestion } from "../utils.ts";

import * as api from "./api.ts";

/* NOTE (invariants)
 * 1: `state.answers[qid]` is always defined
 */

export const NAME = "poll/take";

type State =
  | { mode: undefined }
  | { mode: "submitted" }
  | {
      mode: "opened";
      poll: Poll;
    }
  | {
      mode: "take";
      poll: Poll;
      answers: Answers;
      validated: boolean;
      prevQid?: number;
      currQid?: number;
    }
  | {
      mode: "view";
      poll: Poll;
      userId: string;
      answers: Answers;
    };

const initialState: State = {
  mode: undefined,
};

const InvalidFormError = new Error("error: form data is invalid");

export const submitPoll = createAsyncThunk(
  `${NAME}/submit`,
  async (_, thunkAPI) => {
    const { auth: authState, [NAME]: state } = thunkAPI.getState() as RootState;

    if (state.mode !== "take") return;

    const { poll, answers } = state;
    const { token } = authState;

    const isValid = poll.questions.every(
      (q) =>
        !questionIsShown(poll, q.id) ||
        !validateQuestion(q, answers[q.id].choices, answers[q.id].freeChoice),
    );

    if (!isValid) throw InvalidFormError;

    await api.submitPoll({ token, poll, answers });
  },
);

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    opened(_, action: PayloadAction<Poll>) {
      const poll = action.payload;
      return { mode: "opened", poll };
    },
    submitted() {
      return { mode: "submitted" };
    },
    taken(
      state,
      action: PayloadAction<{
        email: string;
        phone: string;
        organization: string;
        fullname: string;
        position: string;
      }>,
    ) {
      if (state.mode !== "opened") return;
      const poll = state.poll;
      const answers = Object.fromEntries(
        poll.questions.map((q) => [
          q.id,
          {
            choices: [],
            freeChoice:
              q.initialValue === null ? "" : action.payload[q.initialValue],
          },
        ]),
      );
      return {
        mode: "take",
        poll,
        answers,
        validated: false,
      };
    },
    viewed(
      _,
      action: PayloadAction<{
        poll: Poll;
        userId: string;
        answers: (Answers[number] & { qid: number })[];
      }>,
    ) {
      const { poll, userId, answers } = action.payload;
      return {
        mode: "view",
        poll,
        userId,
        answers: Object.fromEntries([
          // Default values:
          ...poll.questions.map((q) => [q.id, { choices: [], freeChoice: "" }]),
          // Actual answers:
          ...answers.map((answer) => [answer.qid, answer]),
        ]),
      };
    },
    multipleChosen(
      state,
      {
        payload,
      }: PayloadAction<{
        qid: number;
        operation: "add" | "remove";
        choiceId: number;
      }>,
    ) {
      if (state.mode !== "take") return;
      state.prevQid = state.currQid;
      state.currQid = payload.qid;
      const answer = state.answers[payload.qid];
      const choices = new Set(answer.choices);
      if (payload.operation === "add") {
        choices.add(payload.choiceId);
      } else {
        choices.delete(payload.choiceId);
      }
      answer.choices = [...choices];
      answer.isDirty = true;
      return state;
    },
    singleChosen(
      state,
      {
        payload,
      }: PayloadAction<{
        qid: number;
        choiceId: number;
      }>,
    ) {
      if (state.mode !== "take") return;
      state.prevQid = state.currQid;
      state.currQid = payload.qid;
      const answer = state.answers[payload.qid];
      answer.choices = [payload.choiceId];
      answer.freeChoice = "";
      answer.isDirty = true;
      return state;
    },
    freeChoiceTyped(
      state,
      {
        payload,
      }: PayloadAction<{
        qid: number;
        isMultipleChoice: boolean;
        text: string;
      }>,
    ) {
      if (state.mode !== "take") return;
      state.prevQid = state.currQid;
      state.currQid = payload.qid;
      const answer = state.answers[payload.qid];
      answer.freeChoice = payload.text;
      if (!payload.isMultipleChoice && answer.choices.length > 0) {
        // We check for length to preserve empty array identity.
        answer.choices = [];
      }
      answer.isDirty = true;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitPoll.pending, (state) => {
        if ("validated" in state) {
          state.validated = true;
        }
      })
      .addCase(submitPoll.fulfilled, (state) => {
        state.mode = "submitted";
      })
      .addCase(submitPoll.rejected, (state) => {
        state.mode = "take";
      });
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export const usePollSelector = <T>(select: (poll: Poll) => T): T | undefined =>
  useSliceSelector((state) =>
    "poll" in state ? select(state.poll) : undefined,
  );

export const useIsValidated = (qid: number) =>
  useSliceSelector((state) => {
    if (state.mode !== "take") return false;
    if (state.validated) return true;
    if (state.prevQid === qid) return true;
    return (
      state.currQid !== undefined &&
      state.currQid !== qid &&
      state.answers[qid].isDirty
    );
  });

export const useIsShown = (qid: number) =>
  usePollSelector((poll) => questionIsShown(poll, qid));

export const useIsReadOnly = () =>
  useSliceSelector(({ mode }) => mode !== "take");

export const useAnswerSelector = <T>(
  qid: number,
  select: (q: Answers[number]) => T,
): T | undefined =>
  useSliceSelector((state) =>
    "answers" in state ? select(state.answers[qid]) : undefined,
  );

export const useQuestionValidation = (q: Question) =>
  useSliceSelector((state) =>
    "answers" in state
      ? validateQuestion(
          q,
          state.answers[q.id].choices,
          state.answers[q.id].freeChoice,
        )
      : "",
  );

export default slice;
