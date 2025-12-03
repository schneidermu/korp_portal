import { useCallback, useState } from "react";

import { mutate } from "swr";

import { DPA_CLOSE_DELAY } from "@app/const";
import { tokenFetch, useTokenFetcher } from "@legacy/features/auth/hooks";

import { APIError } from "@api/common/errors";
import { useFetchUser } from "@api/user";
import { User } from "@api/user/types";

export const agreeDPA = async (token: string) => {
  return tokenFetch(token, "/agree_with_data_processing/", {
    method: "POST",
  }).then((res) => {
    if (res.status !== 200) {
      throw new APIError("agreeing to DPA", res);
    }
    mutate(
      `/colleagues/me/?v=2`,
      (user?: User) =>
        user && {
          ...user,
          agreeDataProcessing: true,
        },
      { revalidate: false },
    );
  });
};

export const useAgreeDPA = () => {
  const tokenFetch = useTokenFetcher();
  const { data: user } = useFetchUser("me");

  const [checked, setChecked] = useState(false);

  const shown = user && !user.agreeDataProcessing;

  const check = useCallback(() => {
    if (!shown) return;

    let timeout = false;
    let ok = false;
    setTimeout(() => {
      timeout = true;
      if (ok) setChecked(ok);
    }, DPA_CLOSE_DELAY);

    tokenFetch("/agree_with_data_processing/", { method: "POST" }).then(
      ({ status }) => {
        if (status === 200) {
          ok = true;
          mutate(
            `/colleagues/me/?v=2`,
            (user?: User) =>
              user && {
                ...user,
                agreeDataProcessing: true,
              },
            { revalidate: false },
          );
          if (timeout) setChecked(true);
        }
      },
    );
  }, [shown, tokenFetch]);

  return { shown, checked, check };
};
