import { useContext } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, Center, HStack, Stack } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { SaxAddCircleOutline } from "@meysam213/iconsax-react";

import { NAVITEMS } from "@app/routes";
import { IconButton } from "@view/Button";
import { ProfileCard } from "@view/ProfileCard";

import { Drawer } from "./Drawer";
import { DrawerContext } from "./Drawer/context";
import { IdeaPrompt } from "./Idea";

export const Navbar = () => {
  return (
    <nav>
      <Drawer
        side="left"
        openedWidth="18rem"
        closedWidth="5.25rem"
        duration={0.3}
        className={stack({
          justify: "space-between",
          gap: 16,
          px: 5,
          py: 8,
          top: "50px",
          w: "18rem",
          h: "calc(100vh - 50px)",
          minH: "52rem",
          position: "sticky",
          shadow: "Sidebar",
        })}
      >
        <Stack gap={3}>
          {NAVITEMS.map((n, i) => (
            <NavItem
              key={i}
              to={n.link}
              name={n.name}
              match={n.matcher}
              actionLink={n.action}
              icon={n.icon}
            />
          ))}
        </Stack>
        <Stack gap={3}>
          <IdeaPrompt />
          <ProfileCardCtx />
        </Stack>
      </Drawer>
    </nav>
  );
};

const ProfileCardCtx = () => {
  const ctx = useContext(DrawerContext);

  return (
    <ProfileCard
      userId="me"
      isOpen={ctx.isOpen}
      transition={{ duration: ctx.duration }}
    />
  );
};

const NavItem = ({
  name,
  to,
  match,
  icon: Icon,
  actionLink,
  count,
}: {
  name: string;
  to: string;
  match: RegExp;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  actionLink?: string;
  count?: number;
}) => {
  const ctx = useContext(DrawerContext);
  const location = useLocation();
  const navigate = useNavigate();

  const matched = location.pathname.match(match);

  return (
    <Link to={to}>
      <HStack
        transition="all 0.2s"
        p={3}
        gap={4}
        bg={{
          base: matched ? "Corporate/Accent" : undefined,
          _hover: !matched ? "#EFF6FF" : undefined,
        }}
        color={{
          base: matched ? "white" : "Grayscale/Black",
          _hover: !matched ? "Corporate/Accent" : undefined,
        }}
        borderRadius="full"
        lineHeight="1.25"
        fontWeight="light"
      >
        <Icon className={css({ w: 5, h: 5 })} />
        {ctx.isOpen && !ctx.isAnimating && (
          <>
            <Box>{name}</Box>
            <Box flexGrow="1" />
            {actionLink && (
              <IconButton
                color={!matched ? "Grayscale/Border" : "white"}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigate(actionLink);
                }}
              >
                <SaxAddCircleOutline className={css({ w: 5, h: 5 })} />
              </IconButton>
            )}
            {count !== undefined && (
              <Center
                transition="all 0.3s"
                color={!matched ? "white" : "Corporate/Accent"}
                bg={!matched ? "Corporate/Accent" : "white"}
                fontSize="Body/XS"
                borderRadius="full"
                w={5}
                h={5}
              >
                <span>{count}</span>
              </Center>
            )}
          </>
        )}
      </HStack>
    </Link>
  );
};
