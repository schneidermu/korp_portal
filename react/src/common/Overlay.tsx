import { ReactNode } from "react";

import clsx from "clsx/lite";
import { motion } from "motion/react";

export const Overlay = ({ children }: { children: ReactNode }) => {
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
