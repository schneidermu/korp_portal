import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { authSlice } from "./auth/slice";
import { pageSlice } from "./page/slice";
import { modalSlice } from "./modal/slice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    page: pageSlice.reducer,
    modal: modalSlice.reducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
