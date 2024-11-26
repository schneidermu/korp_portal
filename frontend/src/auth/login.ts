import { useEffect } from "react";
import { API_BASE_URL } from "../const";
import { useAppDispatch } from "../store";
import { authSlice } from "./slice";

const username = "kuznetsov";
const password = "password";

export const useLogin = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/token/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ auth_token: token }: { auth_token: string }) => {
        fetch(`${API_BASE_URL}/colleagues/${username}`, {
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
  }, [dispatch]);
};
