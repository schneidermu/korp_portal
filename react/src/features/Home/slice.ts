import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@/app/store";

export type State = {
  month: number;
  year: number;
};

const initialState: State = {
  month: 0,
  year: 1970,
};

export const NAME = "home";

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    dateReset(state) {
      const now = new Date();
      state.year = now.getFullYear();
      state.month = now.getMonth();
    },
    monthChanged(state, { payload: diff }: PayloadAction<number>) {
      const m = state.month + diff;
      state.year += Math.floor(m / 12);
      state.month = ((m % 12) + 12) % 12;
    },
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export default slice;

export const actions = slice.actions;
