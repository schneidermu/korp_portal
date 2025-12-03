import { Fragment } from "react/jsx-runtime";

import { Link, LinkProps, useLocation } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, HStack } from "@styled-system/jsx";

import { LINK } from "@app/routes";

const Breadcrumb = ({
  last = false,
  ...rest
}: { last?: boolean } & LinkProps) => {
  return (
    <Link
      className={css({
        color: last ? "Corporate/Accent" : "Grayscale/Border",
        textDecoration: last ? "underline" : undefined,
      })}
      {...rest}
    />
  );
};

export const Breadcrumbs = () => {
  const { pathname } = useLocation();

  const routes = Object.values(LINK).filter(
    (r) => r.crumb && pathname.match(r.crumb.matcher),
  );
  const n = routes.length;

  return (
    <HStack gap={1.5} fontSize="Body/S">
      {routes.map(
        (r, i) =>
          r.crumb && (
            <Fragment key={i}>
              {i > 0 && <Box>-</Box>}
              <Breadcrumb last={i === n - 1} to={r.link}>
                {r.crumb.name}
              </Breadcrumb>
            </Fragment>
          ),
      )}
    </HStack>
  );
};
