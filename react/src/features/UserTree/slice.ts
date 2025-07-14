import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@/app/store";
import { Tree } from "./types";

export const NAME = "userTree";

type State = { tree?: Tree };

const initialState: State = {};

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    view(_, { payload }: PayloadAction<Tree>) {
      return { tree: payload };
    },
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export const actions = slice.actions;
