import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { API_BASE_URL } from "../const";

import { useAppSelector } from "../store";

export interface AuthState {
  userId: string;
  username: string;
  token: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  userId: "",
  username: "",
  token: "",
  isAdmin: false,
  isLoggedIn: false,
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
        username: string;
        token: string;
        isAdmin: boolean;
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
