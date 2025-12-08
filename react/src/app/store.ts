import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import * as authSlice from "@api/auth/slice";
import * as pollTake from "@legacy/features/Poll/take/slice";
import * as pollEdit from "@legacy/features/Poll/edit/slice";
import * as pollList from "@legacy/features/Poll/list/slice";
import * as userTree from "@legacy/features/UserTree/slice";

import * as idea from "@page/skel/view/Idea/slice";
import * as newsCreate from "@page/news/create/slice";

import { secretSantaSlice } from "@ui/organisms/seasonal";

export const store = configureStore({
  devTools: {
    name: "kp",
  },
  reducer: {
    [authSlice.NAME]: authSlice.slice.reducer,
    [pollTake.NAME]: pollTake.slice.reducer,
    [pollEdit.NAME]: pollEdit.slice.reducer,
    [pollList.NAME]: pollList.slice.reducer,
    [userTree.NAME]: userTree.slice.reducer,
    [idea.NAME]: idea.slice.reducer,
    [newsCreate.NAME]: newsCreate.slice.reducer,
    [secretSantaSlice.NAME]: secretSantaSlice.slice.reducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
