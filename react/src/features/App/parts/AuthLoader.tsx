import { Outlet } from "react-router-dom";

import { useLogin } from "@/features/auth/services";

export const AuthLoader = () => {
  const auth = useLogin();

  return auth.isLoggedIn ? <Outlet /> : undefined;
};
