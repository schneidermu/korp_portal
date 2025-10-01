import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import { authSlice } from "@/features/auth/slice";
import * as pollTake from "@/features/Poll/take/slice";
import * as pollEdit from "@/features/Poll/edit/slice";
import * as pollList from "@/features/Poll/list/slice";
import * as userTree from "@/features/UserTree/slice";
import * as calendar from "@/features/Calendar/slice";

import * as idea from "@page/skel/view/Idea/slice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [pollTake.NAME]: pollTake.slice.reducer,
    [pollEdit.NAME]: pollEdit.slice.reducer,
    [pollList.NAME]: pollList.slice.reducer,
    [userTree.NAME]: userTree.slice.reducer,
    [calendar.NAME]: calendar.slice.reducer,
    [idea.NAME]: idea.slice.reducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
