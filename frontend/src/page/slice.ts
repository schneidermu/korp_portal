import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "../store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export interface PageState {
  type: "profile" | "feed" | "org_struct";
}

export interface ProfilePage extends PageState {
  type: "profile";
  userId: string | null;
}

export interface FeedPage extends PageState {
  type: "feed";
}

export interface OrgStructPage extends PageState {
  type: "org_struct";
  unitId: string | null;
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
    viewOrgStruct: (
      _,
      { payload }: PayloadAction<{ unitId: string | null }>,
    ) => ({
      type: "org_struct",
      unitId: payload.unitId,
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
