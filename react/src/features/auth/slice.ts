import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "@/app/store";

export interface AuthState {
  userId: string;
  email: string;
  token: string;
  isAdmin: boolean;
  groups: string[];
  isLoggedIn: boolean;
  orgId: number | null;
}

const initialState: AuthState = {
  userId: "",
  email: "",
  token: "",
  isAdmin: false,
  groups: [],
  isLoggedIn: false,
  orgId: null,
};

export const authSlice = createSlice({
  name: "auth",
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

export const useAuth = () => useAppSelector((state) => state.auth);
export const useToken = () => useAppSelector((state) => state.auth.token);
export const useUserId = () => useAppSelector((state) => state.auth.userId);
