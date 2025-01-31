import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { API_BASE_URL } from "@/app/const";

import { useAppSelector } from "@/app/store";

export interface AuthState {
  userId: string;
  email: string;
  token: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  orgId: number | null;
}

const initialState: AuthState = {
  userId: "",
  email: "",
  token: "",
  isAdmin: false,
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
        orgId: number | null;
      }>,
    ) => {
      return {
        ...payload,
        isLoggedIn: true,
      };
    },
  },
});

export const useAuth = () => useAppSelector((state) => state.auth);
export const useToken = () => useAppSelector((state) => state.auth.token);
export const useUserId = () => useAppSelector((state) => state.auth.userId);

export const fetcher = (path: string, init?: RequestInit) =>
  fetch(API_BASE_URL + path, init);

export const tokenFetch = async (
  token: string,
  path: string,
  init?: RequestInit,
) =>
  fetcher(path, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: "Token " + token,
    },
  });

export const useTokenFetcher = () => {
  const token = useToken();

  return async (path: string, init?: RequestInit) =>
    tokenFetch(token, path, init);
};
