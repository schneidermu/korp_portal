import { ReactNode } from "react";

export const Page = ({
  children,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
}) => {
  return children;
};
