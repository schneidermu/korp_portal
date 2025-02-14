import { useEffect } from "react";

import { API_BASE_URL } from "@/app/const";

import { useAppDispatch } from "@/app/store";
import { authSlice, useAuth } from "./slice";

declare const Liferay: { authToken: string };

const liferayFetchEmail = async (): Promise<string> => {
  return fetch("/api/jsonws/user/get-current-user", {
    method: "POST",
    body: new URLSearchParams([["p_auth", Liferay.authToken]]),
  })
    .then((res) => res.json())
    .then(({ emailAddress }: { emailAddress: string }) => emailAddress);
};

export const useLogin = () => {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (auth.isLoggedIn) {
      return;
    }

    (async () => {
      const pauth =
        import.meta.env.VITE_LIFERAY_EMBED === "true"
          ? Liferay.authToken
          : import.meta.env.VITE_PAUTH;

      const email =
        import.meta.env.VITE_LIFERAY_EMBED === "true"
          ? await liferayFetchEmail()
          : import.meta.env.VITE_EMAIL;

      const { auth_token: token }: { auth_token: string } = await fetch(
        `${API_BASE_URL}/auth/token/login`,
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ username: email, password: pauth }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      ).then((res) => res.json());

      return fetch(`${API_BASE_URL}/colleagues/me/`, {
        headers: {
          Authorization: "Token " + token,
        },
      })
        .then((res) => res.json())
        .then(
          ({
            id: userId,
            is_superuser: isAdmin,
            organization,
          }: {
            id: string;
            is_superuser: boolean;
            organization: null | { id: number };
          }) => {
            dispatch(
              authSlice.actions.login({
                userId,
                email,
                token,
                isAdmin,
                orgId: organization?.id ?? null,
              }),
            );
          },
        );
    })();
  }, [dispatch, auth.isLoggedIn]);

  return auth;
};
