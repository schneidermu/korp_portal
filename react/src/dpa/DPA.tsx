import { useState } from "react";

import clsx from "clsx/lite";
import { AnimatePresence, motion } from "motion/react";

import { DPA_CLOSE_DELAY, DPA_TERMS_URL } from "@/app/const";

import { useTokenFetcher } from "@/auth/slice";
import { Icon } from "@/common/Icon";

import tickIcon from "@/assets/tick.svg";
import { useFetchUser } from "@/user/api";
import { mutate } from "swr";

const OneshotCheckbox = ({
  className,
  onCheck,
}: {
  className: string;
  onCheck: () => void;
}) => {
  const [checked, setChecked] = useState(false);

  const check = () => {
    setChecked(true);
    onCheck();
  };

  return (
    <div className={clsx(className, "relative")}>
      <div
        style={{ width: 23, height: 23 }}
        className={clsx(
          "border border-[#1956A8] rounded-[5px]",
          "flex justify-center items-center",
        )}
        onClick={check}
      >
        {checked && <Icon src={tickIcon} width="70%" height="70%" />}
      </div>
    </div>
  );
};

/** Data Processing Agreement (DPA) Component
 *
 * This component displays a notification to the user, prompting them to agree
 * to the DPA. It includes a checkbox that, when checked, triggers a delay
 * before automatically closing the notification. The delay is defined by the
 * `DPA_CLOSE_DELAY` constant.
 *
 * The notification is styled to appear at the bottom-right of the screen and
 * contains a link (defined by the `DPA_TERMS_URL` constant) to the full terms
 * of the DPA, allowing users to review the agreement before giving their
 * consent.
 *
 * * DPA = согласие на обработку персональных данных
 */
export const DPA = () => {
  const tokenFetch = useTokenFetcher();
  const { user } = useFetchUser("me");

  const [checked, setChecked] = useState(false);

  if (!user || user.agreeDataProcessing) {
    return undefined;
  }

  const check = () => {
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
  };

  return (
    <AnimatePresence>
      {checked || (
        <motion.div
          initial={{ bottom: -200 }}
          animate={{ bottom: 8 }}
          exit={{ bottom: -200 }}
          className={clsx(
            "fixed right-[12px]",
            "w-[690px] px-[48px] py-[64px]",
            "flex gap-[12px]",
            "bg-white rounded border border-[#2164be]",
          )}
        >
          <OneshotCheckbox className="flex mt-[6px]" onCheck={check} />
          <span className="text-[26px]">
            я даю согласие на обработку{" "}
            <a
              href={DPA_TERMS_URL}
              target="_blank"
              className="underline text-[#2164be]"
            >
              персональных данных
            </a>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
