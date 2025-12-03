import { Outlet } from "react-router-dom";

import { useAuth } from "@legacy/features/auth/slice";

export const ProtectedRoute = ({ groups = [] }: { groups?: string[] }) => {
  const auth = useAuth();
  const allowed =
    groups.length === 0 || groups.some((group) => auth.groups.includes(group));

  if (allowed) return <Outlet />;

  return <div>"У вас нет доступа к этой странице :("</div>;
};
