import { Link, LinkProps } from "react-router-dom";

export const RRLink = ({
  to,
  children,
  ...rest
}: Omit<LinkProps, "to"> & { to: string | null }) => {
  if (to === null) return children;
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
};
