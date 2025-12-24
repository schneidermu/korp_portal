import { useCallback, useState } from "react";

import { DPA_CLOSE_DELAY } from "@app/const";
import { useAuth } from "@api/auth";

import { agreeDPA } from "@api/dpa";
import { useFetchUser } from "@api/user";

export const useAgreeDPA = () => {
  const { token } = useAuth();
  const { data: user } = useFetchUser("me");

  const [checked, setChecked] = useState(false);

  const shown = user && !user.agreeDataProcessing;

  const check = useCallback(async () => {
    if (!shown) return;

    let timeout = false;
    let ok = false;
    setTimeout(() => {
      timeout = true;
      if (ok) setChecked(ok);
    }, DPA_CLOSE_DELAY);

    await agreeDPA(token);
    ok = true;
    if (timeout) setChecked(true);
  }, [token, shown]);

  return { shown, checked, check };
};
