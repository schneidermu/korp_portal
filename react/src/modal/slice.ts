import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { ReactNode } from "react";
import { useAppSelector } from "../store";

type State = {
  isShown: boolean;
  content?: ReactNode;
};

const initialState: State = { isShown: false };

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    hide: () => ({ isShown: false }),
    show: (
      _,
      { payload: { content } }: PayloadAction<{ content: ReactNode }>,
    ) => ({
      isShown: true,
      content,
    }),
  },
});

export const useModal = () => useAppSelector((state) => state.modal);
