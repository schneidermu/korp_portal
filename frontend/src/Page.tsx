import { ReactNode } from "react";

import clsx from "clsx/lite";

export default function Page({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main
      className={clsx(
        "border-[3px] border-light-gray rounded",
        "shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]",
      )}
    >
      <h2
        className={clsx(
          "flex items-center",
          "mb-[70px] h-[70px] pl-[45px]",
          "bg-light-gray",
          "text-[30px] font-medium",
        )}
      >
        {title}
      </h2>
      {children}
    </main>
  );
}
