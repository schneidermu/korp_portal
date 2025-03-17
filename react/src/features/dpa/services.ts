import { useCallback, useState } from "react";

import { mutate } from "swr";

import { DPA_CLOSE_DELAY } from "@/app/const";

import { useTokenFetcher } from "@/features/auth/hooks";
import { useFetchUser } from "@/features/user/services";

export const useAgreeDPA = () => {
  const tokenFetch = useTokenFetcher();
  const { user } = useFetchUser("me");

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
            `/colleages/${user.id}`,
            {
              ...user,
              agreeDataProcessing: true,
            },
            { revalidate: false },
          );
          if (timeout) setChecked(true);
        }
      },
    );
  }, [user, shown, tokenFetch]);

  return { shown, checked, check };
};
