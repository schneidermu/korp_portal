import { useContext, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, Center, HStack, Stack, styled } from "@styled-system/jsx";
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

import { Button, IconButton } from "@view/Button";
import { ProfileCard } from "@view/ProfileCard";

import { Modal } from "@/v2/view/Modal";
import { Drawer, DrawerContext } from "./Drawer";

const links = [
  {
    name: "Домашняя страница",
    to: "/",
    match: /^\/$/,
    icon: SaxHomeOutline,
  },
  {
    name: "Наша жизнь",
    to: "/feed",
    match: /^\/feed$/,
    icon: SaxArchiveBookOutline,
  },
  {
    name: "Орг. структура",
    to: "/tree",
    match: /^\/tree\/?.*$/,
    icon: Sax3DcubeOutline,
  },
  {
    name: "Облако",
    to: "/nextcloud",
    match: /^\/nextcloud$/,
    icon: SaxFolderCloudOutline,
  },
  {
    name: "Опросы",
    to: "/polls/dashboard",
    /* TODO: restrict actions to only certain groups */
    actionLink: "/polls/create",
    match: /^\/polls\/?.*/,
    icon: SaxMessageQuestionOutline,
  },
  {
    name: "Заявки",
    to: "/forms/dashboard",
    match: /^\/forms\/?.*/,
    icon: SaxMessageAdd1Outline,
  },
  {
    name: "Сегменты",
    to: "/segments",
    match: /^\/segments\/?.*/,
    icon: Sax3SquareOutline,
  },
];

export const Navbar = () => {
  /* TODO: count polls */
  const counts: { [key: string]: number } = { Опросы: 2 };

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
          {links.map((link) => (
            // TODO: do manually
            <NavItem key={link.to} link={link} count={counts[link.name]} />
          ))}
        </Stack>
        <Stack gap={3}>
          {/*
          <SubmitIdea />
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

const IdeaForm = () => {
  return (
    <styled.form
      borderRadius="25px"
      /* FIXME */ className={stack({})}
    ></styled.form>
  );
};

export const SubmitIdea = () => {
  const ctx = useContext(DrawerContext);
  const [isOpen, setIsOpen] = useState(false);

  if (!ctx.isOpen || ctx.isAnimating) return;

  return (
    <styled.article
      className={stack({ gap: 4 })}
      borderColor="Corporate/Accent"
      borderWidth="1px"
      color="Grayscale/Black"
      borderRadius="24px" /* FIXME */
      p={6}
    >
      <Stack gap={3} textAlign="center">
        <styled.h1 fontWeight="semibold" fontSize="Body/M">
          У Вас есть идеи?
        </styled.h1>
        <styled.p fontSize="Body/XS">
          Предложите идею по развитию внутреннего контура, и мы обязательно её
          реализуем
        </styled.p>
      </Stack>
      {/* TODO: icons */}
      <Button display="flex" onClick={() => setIsOpen(true)}>
        Предложить идею
      </Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <IdeaForm />
      </Modal>
    </styled.article>
  );
};

const NavItem = ({
  link: l,
  count,
}: {
  link: (typeof links)[number];
  count?: number;
}) => {
  const ctx = useContext(DrawerContext);
  const location = useLocation();

  const matched = location.pathname.match(l.match);

  return (
    <Link to={l.to} key={l.name}>
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
        // borderRadius="8px" /* FIXME */
        borderRadius="full"
        lineHeight="1.25"
        fontWeight="light"
      >
        <l.icon className={css({ w: 5, h: 5 })} />
        {ctx.isOpen && !ctx.isAnimating && (
          <>
            <Box>{l.name}</Box>
            <Box flexGrow="1" />
            {l.actionLink && (
              <Link
                to={l.actionLink}
                className={css({
                  h: 5 /* NOTE: dunno why the Link adds height pixels otherwise */,
                })}
              >
                <IconButton color={!matched ? "Grayscale/Border" : "white"}>
                  <SaxAddCircleOutline className={css({ w: 5, h: 5 })} />
                </IconButton>
              </Link>
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
