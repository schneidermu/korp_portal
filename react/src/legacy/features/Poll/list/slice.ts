import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@app/store";
import { useAuth } from "@legacy/features/auth/slice";

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

export const useTab = (): State["tab"] => {
  const { groups } = useAuth();
  const tab = useSliceSelector(({ tab }) => tab);
  if (!groups.includes("create-poll")) {
    return "available";
  }
  return tab;
};

export default slice;

export const actions = slice.actions;
