import { useEffect } from "react";

import { BACKEND_API_PREFIX } from "@/app/const";

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

export interface Credentials {
  email: string;
  password: string;
}

export const useLogin = (credentials?: Credentials) => {
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
          : import.meta.env.VITE_PAUTH || credentials?.password || "";

      const email =
        import.meta.env.VITE_LIFERAY_EMBED === "true"
          ? await liferayFetchEmail()
          : import.meta.env.VITE_EMAIL || credentials?.email || "";

      if (!pauth || !email) {
        return;
      }

      const { auth_token: token }: { auth_token: string } = await fetch(
        `${BACKEND_API_PREFIX}/auth/token/login/`,
        {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ username: email, password: pauth }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      ).then((res) => {
        if (res.status !== 200) {
          throw new Error("bad login");
        }
        return res.json();
      });

      return fetch(`${BACKEND_API_PREFIX}/colleagues/me/`, {
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
  }, [dispatch, auth.isLoggedIn, credentials]);

  return auth;
};
