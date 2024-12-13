import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../store";

export type ProfilePage = {
  type: "profile";
  userId: string;
};

export type FeedPage = {
  type: "feed";
};

export type OrgStructPage = {
  type: "org_struct";
  query: string[];
};

export type PageState = ProfilePage | FeedPage | OrgStructPage;

const initialState: PageState = {
  type: "profile",
  userId: "me",
} as PageState;

export const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    viewFeed: () => ({ type: "feed" }) as FeedPage,
    viewProfile: (_, { payload }: PayloadAction<{ userId: string }>) => ({
      type: "profile",
      userId: payload.userId,
    }),
    viewOrgStruct: (_, { payload }: PayloadAction<{ query: string[] }>) => ({
      type: "org_struct",
      query: payload.query ?? [],
    }),
  },
});

export const usePage = () => useAppSelector((state) => state.page);

export const useProfile = (userId: string) => {
  const dispatch = useDispatch();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    dispatch(pageSlice.actions.viewProfile({ userId }));
  }, [userId, dispatch]);
};
