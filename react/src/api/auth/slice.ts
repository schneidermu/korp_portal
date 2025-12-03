import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@app/store";

import { Auth } from "./types";

type State = Auth;

const initialState: State = {
  userId: "",
  email: "",
  token: "",
  isAdmin: false,
  groups: [],
  isLoggedIn: false,
  orgId: null,
};

export const NAME = "auth";

export const slice = createSlice({
  name: NAME,
  initialState,
  reducers: {
    login: (
      _,
      {
        payload,
      }: PayloadAction<{
        userId: string;
        email: string;
        token: string;
        isAdmin: boolean;
        groups: string[];
        orgId: number | null;
      }>,
    ) => {
      return {
        ...payload,
        isLoggedIn: true,
      };
    },
    logout: () => initialState,
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export const useAuth = () => useSliceSelector((state) => state);
