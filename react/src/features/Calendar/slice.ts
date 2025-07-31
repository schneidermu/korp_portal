import { Temporal } from "temporal-polyfill";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@/app/store";

export type State = {
  year: number;
  month: number;
  day: number;
};

const initialState: State = {
  year: 1970,
  month: 1,
  day: 1,
};

export const NAME = "calendar";

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    dateReset(state) {
      const now = Temporal.Now.plainDateISO();
      [state.year, state.month, state.day] = [now.year, now.month, now.day];
      return state;
    },
    monthChanged(state, { payload: diff }: PayloadAction<number>) {
      const date = Temporal.PlainDate.from({
        year: state.year,
        month: state.month,
        day: state.day,
      }).add({ months: diff });

      [state.year, state.month, state.day] = [date.year, date.month, date.day];

      return state;
    },
    dateSet(
      state,
      { payload }: PayloadAction<Pick<State, "year" | "month" | "day">>,
    ) {
      Object.assign(state, payload);
    },
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export default slice;

export const actions = slice.actions;
