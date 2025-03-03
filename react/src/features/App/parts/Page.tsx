import { Outlet } from "react-router-dom";

import { useLogin } from "@/features/auth/services";

import { DPA } from "@/features/dpa/comps/DPA";

import { NavBar } from "./NavBar";

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
