import * as R from "radashi";
import { Temporal } from "temporal-polyfill";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState, useAppSelector } from "@app/store";
import { parseAPIInstant } from "@util/date";

import * as api from "@api/seasonal/santa";
import { Participant, SecretSanta } from "@api/seasonal/santa/types";

export type State = {
  isOpen: boolean;
  participating: boolean;
  deadline: string | null; // datetime
  budget: string;
  isActive: boolean;
  giftGiver: Participant;
  giftReceiver: Participant | null;
};

const initialState: State = {
  isOpen: false,
  participating: false,
  deadline: null,
  budget: "",
  isActive: false,
  giftGiver: {
    id: "",
    address: "",
    zipCode: null,
    phone: "",
    wishes: "",
  },
  giftReceiver: null,
};

export const NAME = "v2/seasonal/secretSanta";

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    hydrated(state, { payload: s }: PayloadAction<SecretSanta>) {
      Object.assign(state, R.omit(s, ["giftGiver"]));
      state.participating = s.giftGiver !== null;
      if (s.giftGiver) {
        state.giftGiver = s.giftGiver;
      }
    },
    opened(state) {
      state.isOpen = true;
    },
    closed(state) {
      state.isOpen = false;
    },
    joined(state) {
      state.participating = true;
      state.isOpen = false;
    },
    deleted(state) {
      state.giftGiver = initialState.giftGiver;
      state.participating = false;
    },
    edited(
      state,
      { payload: participant }: PayloadAction<Partial<Participant>>,
    ) {
      Object.assign(state.giftGiver, participant);
    },
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export const useGiftGiverSelector = <T>(select: (data: Participant) => T): T =>
  useSliceSelector((state) => select(state.giftGiver));

export const useGiftReceiverSelector = <T>(
  select: (data: Participant) => T,
): T | null =>
  useSliceSelector((state) => state.giftReceiver && select(state.giftReceiver));

export const useParsedDeadline = () => {
  const s = useSliceSelector((s) => s.deadline);
  if (s === null) return null;
  return parseAPIInstant(s);
};

export const useFormattedDeadline = () => {
  const deadline = useParsedDeadline();
  if (!deadline) {
    return "";
  }
  return deadline.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const useIsRegistrationFinished = () => {
  const now = Temporal.Now.instant();
  const deadline = useParsedDeadline();
  if (!deadline) {
    return false;
  }
  return Temporal.Instant.compare(now, deadline) > 0;
};

export const updateSecretSanta = createAsyncThunk(
  `${NAME}/update`,
  async (_, thunkAPI) => {
    const { auth, [NAME]: state } = thunkAPI.getState() as RootState;

    const participant = state.giftGiver;

    if (!participant) return;

    await api.updateSecretSanta(auth.token, participant, {
      create: !state.participating,
    });

    thunkAPI.dispatch(actions.joined());
  },
);

export const deleteSecretSanta = createAsyncThunk(
  `${NAME}/delete`,
  async (_, thunkAPI) => {
    const { auth } = thunkAPI.getState() as RootState;

    await api.deleteSecretSanta(auth.token);

    thunkAPI.dispatch(actions.deleted());
  },
);

export default slice;
export const actions = slice.actions;
