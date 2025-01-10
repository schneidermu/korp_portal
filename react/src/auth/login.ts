import { useEffect } from "react";

import { API_BASE_URL } from "@/app/const";

import { useAppDispatch } from "@/app/store";
import { authSlice, useAuth } from "./slice";

const username = "kuznetsov";
const password = "password";

export const useLogin = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (auth.isLoggedIn) {
      return;
    }

    fetch(`${API_BASE_URL}/auth/token/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ auth_token: token }: { auth_token: string }) => {
        fetch(`${API_BASE_URL}/colleagues/me/`, {
          headers: {
            Authorization: "Token " + token,
          },
        })
          .then((res) => res.json())
          .then(
            ({
              id: userId,
              is_superuser: isAdmin,
            }: {
              id: string;
              is_superuser: boolean;
            }) => {
              dispatch(
                authSlice.actions.login({ userId, username, token, isAdmin }),
              );
            },
          );
      });
  }, [dispatch, auth.isLoggedIn]);

  return auth;
};
