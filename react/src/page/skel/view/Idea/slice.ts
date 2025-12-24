import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState, useAppSelector } from "@app/store";

import * as api from "@api/idea";

export type State = {
  isOpen: boolean;
  isSuccess: boolean;
  text: string;
};

const initialState: State = {
  isOpen: false,
  isSuccess: false,
  text: "",
};

export const NAME = "v2/idea";

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    opened(state) {
      state.isOpen = true;
      state.isSuccess = false;
    },
    closed(state) {
      state.isOpen = false;
    },
    succeed(state) {
      state.isSuccess = true;
      state.text = "";
    },
    typed(state, { payload: text }: PayloadAction<string>) {
      state.text = text;
    },
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export const submitIdea = createAsyncThunk(
  `${NAME}/submit`,
  async (_, thunkAPI) => {
    const {
      auth: { token },
      [NAME]: { text },
    } = thunkAPI.getState() as RootState;

    await api.submitIdea({ token, text });
    thunkAPI.dispatch(actions.succeed());
  },
);

export default slice;
export const actions = slice.actions;
