import { useAuth } from "@/features/auth/slice";

export const ShowProtected = ({
  groups,
  children,
  forbidden,
}: {
  groups: string[];
  children: React.ReactNode;
  forbidden?: React.ReactNode;
}) => {
  const auth = useAuth();
  const allowed = groups.some((group) => auth.groups.includes(group));

  return allowed ? children : forbidden;
};
