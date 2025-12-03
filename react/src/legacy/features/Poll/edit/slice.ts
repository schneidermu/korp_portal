import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState, useAppSelector } from "@app/store";

import { index, max, remove } from "@legacy/shared/utils/index.ts";
import { NewPoll, NewQuestion, Poll, PollRaw } from "../types.ts";

import * as api from "./api.ts";

export type NewPollUpdate = Partial<Omit<NewPoll, "questions">>;
export type NewQuestionUpdate = Partial<NewQuestion>;

type State =
  | { mode: undefined }
  | {
      mode: "create" | "view" | "edit";
      poll: NewPoll;
      // Question ids
      qids: number[];
      isDirty?: boolean;
    };

const initialState: State = {
  mode: undefined,
};

export const NAME = "poll/edit";

export const savePoll = createAsyncThunk(
  `${NAME}/submit`,
  async (pollId: number | undefined, thunkAPI) => {
    const { auth: authState, [NAME]: state } = thunkAPI.getState() as RootState;

    if (!state.mode) return;

    const { poll, qids } = state;
    const { token, orgId } = authState;

    if (!poll) return;

    const res = await api.savePoll({
      token,
      orgId,
      poll,
      qids,
      pollId,
    });

    const raw: PollRaw = await res.json();
    return raw.id;
  },
);

export const publishPoll = createAsyncThunk(
  `${NAME}/publish`,
  async (pollId: number, thunkAPI) => {
    const {
      auth: { token },
      [NAME]: { mode },
    } = thunkAPI.getState() as RootState;

    if (mode !== "view") return;

    const res = await api.publishPoll({
      token,
      pollId,
    });

    const raw: PollRaw = await res.json();
    return raw.pub_date;
  },
);

const createQuestion = (): NewQuestion => ({
  text: "",
  isMultipleChoice: false,
  isRequired: true,
  acceptFreeChoice: false,
  choices: { 0: "" },
  cids: [0],
});

const addChoice = (q: NewQuestion) => {
  const cid = max(q.cids) + 1;
  q.cids.push(cid);
  q.choices[cid] = "";
};

const removeChoice = (q: NewQuestion, cid: number) => {
  q.cids = remove(q.cids, cid);
  delete q.choices[cid];
};

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    created(_, { payload }: PayloadAction<{ orgId?: number }>) {
      const orgId = payload.orgId;
      return {
        mode: "create",
        poll: {
          name: "",
          description: "",
          status: "draft",
          orgs: orgId === undefined ? [] : [orgId],
          isPublic: false,
          isAnonymous: false,
          questions: [createQuestion()],
        },
        qids: [0],
      };
    },
    viewed(_, { payload }: PayloadAction<Poll>) {
      const p = payload;
      const poll: NewPoll = {
        name: p.name,
        description: p.description,
        status: p.status,
        orgs: p.orgs,
        isPublic: p.isPublic,
        isAnonymous: p.isAnonymous,
        questions: Object.fromEntries(
          p.questions.map((q) => [
            q.id,
            {
              text: q.text,
              isRequired: q.isRequired,
              isMultipleChoice: q.isMultipleChoice,
              acceptFreeChoice: q.acceptFreeChoice,
              choices: {
                0: "",
                ...Object.fromEntries(q.choices.map((c) => [c.id, c.text])),
              },
              cids: [...q.choices.map((c) => c.id), 0],
            },
          ]),
        ),
      };
      return {
        mode: "view",
        poll,
        qids: p.questions.map((q) => q.id),
      };
    },
    edited(state) {
      if (state.mode !== "view") return;
      state.mode = "edit";
      return state;
    },
    infoUpdated(state, { payload }: PayloadAction<NewPollUpdate>) {
      if (!state.mode || state.mode === "view") return;
      Object.assign(state.poll, payload);
      state.isDirty = true;
      return state;
    },
    questionAdded(state) {
      if (!state.mode || state.mode === "view") return;
      const qid = max(state.qids) + 1;
      state.qids.push(qid);
      state.poll.questions[qid] = createQuestion();
      state.isDirty = true;
      return state;
    },
    questionRemoved(state, { payload }: PayloadAction<{ qid: number }>) {
      if (!state.mode || state.mode === "view") return;
      state.qids = remove(state.qids, payload.qid);
      delete state.poll.questions[payload.qid];
      state.isDirty = true;
      return state;
    },
    questionsReordered(state, { payload }: PayloadAction<number[]>) {
      if (!state.mode || state.mode === "view") return;
      state.qids = payload;
      state.isDirty = true;
      return state;
    },
    questionUpdated(
      state,
      { payload }: PayloadAction<{ qid: number; update: NewQuestionUpdate }>,
    ) {
      if (!state.mode || state.mode === "view") return;
      Object.assign(state.poll.questions[payload.qid], payload.update);
      state.isDirty = true;
      return state;
    },
    choiceAdded(state, { payload }: PayloadAction<{ qid: number }>) {
      if (!state.mode || state.mode === "view") return;
      const q = state.poll.questions[payload.qid];
      addChoice(q);
      state.isDirty = true;
      return state;
    },
    choiceRemoved(
      state,
      { payload }: PayloadAction<{ qid: number; cid: number }>,
    ) {
      if (!state.mode || state.mode === "view") return;
      const q = state.poll.questions[payload.qid];
      removeChoice(q, payload.cid);
      state.isDirty = true;
      return state;
    },
    choicesReordered(
      state,
      { payload }: PayloadAction<{ qid: number; order: number[] }>,
    ) {
      if (!state.mode || state.mode === "view") return;
      const q = state.poll.questions[payload.qid];
      q.cids = payload.order;
      state.isDirty = true;
      return state;
    },
    choiceUpdated(
      state,
      { payload }: PayloadAction<{ qid: number; cid: number; text: string }>,
    ) {
      if (!state.mode || state.mode === "view") return;
      const q = state.poll.questions[payload.qid];
      q.choices[payload.cid] = payload.text;

      const isLastTyped =
        payload.text.length > 0 && index(q.cids, -1) === payload.cid;
      const isSecondLastCleared =
        payload.text.length === 0 && index(q.cids, -2) === payload.cid;

      if (isLastTyped) {
        addChoice(q);
      } else if (isSecondLastCleared) {
        removeChoice(q, index(q.cids, -1));
      }
      state.isDirty = true;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(savePoll.fulfilled, (state) => {
      if (state.mode === "edit") {
        state.isDirty = false;
        state.mode = "view";
      }
    });
    builder.addCase(publishPoll.fulfilled, (state, { payload }) => {
      if (state.mode === "view") {
        state.poll.status = "published";
        state.poll.publishedAt = payload;
      }
    });
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export const usePollSelector = <T>(
  select: (poll: NewPoll) => T,
): T | undefined =>
  useSliceSelector((state) => state.mode && state.poll && select(state.poll));

export const useQuestionSelector = <T>(
  index: number,
  select: (q?: NewQuestion) => T,
): T =>
  useSliceSelector((state) =>
    select(state.mode && state.poll.questions[index]),
  );

export const useQuestionOrder = (qid: number): number =>
  useSliceSelector((state) =>
    state.mode ? state.qids.findIndex((id) => id === qid) + 1 : 0,
  );

export const useIsReadOnly = (): boolean =>
  useSliceSelector((state) => state.mode === "view");

export default slice;

export const actions = slice.actions;
