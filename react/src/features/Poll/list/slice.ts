import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@/app/store";

export type State = {
  tab: "own" | "available";
};

const initialState: State = {
  tab: "own",
};

export const NAME = "poll/list";

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    tabSwitched(state, { payload }: PayloadAction<State["tab"]>) {
      state.tab = payload;
      return state;
    },
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export default slice;

export const actions = slice.actions;
