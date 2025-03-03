import { ReactNode, useEffect } from "react";

import clsx from "clsx/lite";
import { motion } from "motion/react";

export const PageSkel = ({
  title,
  heading,
  id = "",
  slot,
  children,
}: {
  title: string;
  heading: string;
  id?: string;
  slot?: ReactNode;
  children: ReactNode;
}) => {
  useEffect(() => {
    document.title = `${title} | КП`;
  }, [title]);

  id = title + "/" + id;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  return (
    <main
      className={clsx(
        "border-[3px] border-light-gray rounded",
        "shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]",
      )}
    >
      <div
        className={clsx(
          "flex justify-between items-center",
          "mb-[70px] h-[70px] px-[45px]",
          "bg-light-gray",
        )}
      >
        <h1 className="text-[30px] font-medium">{heading}</h1>
        {slot}
      </div>
      {children}
    </main>
  );
};

export const AnimatePage = ({
  id,
  children,
}: {
  id?: React.Key;
  children?: ReactNode;
}) => {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "anticipate" }}
    >
      {children}
    </motion.div>
  );
};
