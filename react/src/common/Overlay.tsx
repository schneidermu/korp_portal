import { ReactNode, useEffect } from "react";

import clsx from "clsx/lite";
import { motion } from "motion/react";

export const Overlay = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const html = document.documentElement;

    const w1 = html.offsetWidth;
    html.style.overflow = "hidden";
    const w2 = html.offsetWidth;

    const scrollBarWidth = w2 - w1;

    html.style.paddingRight = `${scrollBarWidth}px`;

    return () => {
      html.style.overflow = "unset";
      html.style.paddingRight = "0";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={clsx(
        "fixed top-0 left-0 w-full h-screen",
        "flex justify-center items-center",
        "bg-modal z-40",
      )}
    >
      {children}
    </motion.div>
  );
};
