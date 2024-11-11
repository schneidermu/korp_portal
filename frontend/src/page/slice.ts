import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "../store";
import { useEffect } from "react";
import stableHash from "stable-hash";
import { useDispatch } from "react-redux";

export interface PageState {
  type: "profile" | "feed";
}

export interface ProfilePage extends PageState {
  type: "profile";
  userId: string | null;
}

export interface FeedPage extends PageState {
  type: "feed";
}

const initialState = {
  type: "profile",
  userId: "",
} as PageState;

export const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    viewFeed: () => ({ type: "feed" }) as FeedPage,
    viewProfile: (
      _,
      { payload }: PayloadAction<{ userId: string | null }>,
    ) => ({
      type: "profile",
      userId: payload.userId,
    }),
  },
});

export const usePage = () => useAppSelector((state) => state.page);

export const useProfile = (userId: string) => {
  const dispatch = useDispatch();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    dispatch(pageSlice.actions.viewProfile({ userId }));
  }, [userId]);
};
