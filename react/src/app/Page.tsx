import { ReactNode, useEffect } from "react";
import { Outlet } from "react-router-dom";

import clsx from "clsx/lite";
import { motion } from "motion/react";

import { useLogin } from "@/auth/login";

import { DPA } from "@/dpa/DPA";
import { NavBar } from "./NavBar";

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

export const Page = () => {
  const auth = useLogin();

  if (!auth.isLoggedIn) {
    return;
  }

  return (
    <div className="max-w-[1920px] mx-auto mb-[300px] min-h-screen">
      <div className="flex flex-col gap-[45px] max-w-[1404px] mx-auto mt-[45px] text-[24px]">
        <NavBar></NavBar>
        <Outlet />
        <DPA />
      </div>
    </div>
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
