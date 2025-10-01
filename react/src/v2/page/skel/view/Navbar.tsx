import { useContext } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, Center, HStack, Stack } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import {
  Sax3DcubeOutline,
  Sax3SquareOutline,
  SaxAddCircleOutline,
  SaxArchiveBookOutline,
  SaxFolderCloudOutline,
  SaxHomeOutline,
  SaxMessageAdd1Outline,
  SaxMessageQuestionOutline,
} from "@meysam213/iconsax-react";

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
          <NavItem
            name="Домашняя страница"
            to="/"
            match={/^\/$/}
            icon={SaxHomeOutline}
          />
          <NavItem
            name="Наша жизнь"
            to="/feed"
            match={/^\/feed$/}
            icon={SaxArchiveBookOutline}
          />
          <NavItem
            name="Орг. структура"
            to="/tree"
            match={/^\/tree\/?.*$/}
            icon={Sax3DcubeOutline}
          />
          <NavItem
            name="Облако"
            to="/nextcloud"
            match={/^\/nextcloud$/}
            icon={SaxFolderCloudOutline}
          />
          <NavItem
            name="Опросы"
            to="/polls/dashboard"
            // TODO: restrict actions to only certain groups
            actionLink={"/polls/create"}
            match={/^\/polls\/?.*/}
            icon={SaxMessageQuestionOutline}
          />
          <NavItem
            name="Заявки"
            to="/forms/dashboard"
            match={/^\/forms\/?.*/}
            icon={SaxMessageAdd1Outline}
          />
          <NavItem
            name="Сегменты"
            to="/segments"
            match={/^\/segments\/?.*/}
            icon={Sax3SquareOutline}
          />
        </Stack>
        <Stack gap={3}>
          <IdeaPrompt />
          {/*
          <NavItem
            link={{
              to: "/",
              name: "Уведомления",
              icon: SaxNotificationOutline,
              match: /^$/,
            }}
            count={3}
          />
          */}
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
  icon,
  actionLink,
  count,
}: {
  name: string;
  to: string;
  match: RegExp;
  icon: typeof Sax3DcubeOutline;
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
        {icon({ className: css({ w: 5, h: 5 }) })}
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
