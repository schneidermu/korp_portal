import { useContext } from "react";

import { Link } from "react-router-dom";

import * as R from "radashi";

import { css } from "@styled-system/css";
import { Box, BoxProps, Center, Stack, styled } from "@styled-system/jsx";

import { useFetchUser } from "@api/user";
import { User } from "@api/user/types";

import { Avatar } from "@/v2/view/Avatar";
import { CircProgress } from "@view/CircProgress";
import { Drawer, DrawerContext } from "./Drawer";
import { Events } from "./Events";

export const Sidebar = () => {
  return (
    <aside>
      <Drawer
        side="right"
        openedWidth="24rem"
        closedWidth="5.25rem"
        duration={0.3}
        className={css({
          py: 8,
          px: 5,
          w: "24rem",
          h: "calc(100vh - 50px)",
          minH: "52rem",
          shadow: "Sidebar",
          position: "sticky",
          top: "50px",
        })}
      >
        <SidebarWrapper />
      </Drawer>
    </aside>
  );
};

const SidebarWrapper = () => {
  const ctx = useContext(DrawerContext);

  return (
    <Stack gap={ctx.isOpen ? 16 : 4}>
      <ProfileCard />
      <Events />
    </Stack>
  );
};

const ProfileCard = () => {
  const ctx = useContext(DrawerContext);
  const { data: user } = useFetchUser("me");

  return (
    <Stack gap={4} align="center">
      {user ? (
        <Link to={`/profile/${user.id}`}>
          <AvatarWithRating user={user} w={24} h={24} />
        </Link>
      ) : (
        <Box h={24} />
      )}
      {ctx.isOpen && (
        <>
          <Stack gap={1} align="center">
            <styled.h1
              fontSize="Headline/H4"
              fontWeight="semibold"
              textDecoration={{ _hover: "underline" }}
              color="Grayscale/Black"
            >
              {user && (
                <Link to={`/profile/${user.id}`}>
                  {user.lastName} {user.firstName}
                </Link>
              )}
              &nbsp;
            </styled.h1>
            <Box fontSize="Body/XS" color="Grayscale/Border">
              {user?.position} &nbsp;
            </Box>
          </Stack>
          <Box
            fontSize="Body/S"
            py={1.5}
            px={3}
            w="full"
            color="Corporate/Accent"
            bg="Complementary/Blue/0.5"
            borderRadius="full"
            borderWidth="1px"
            borderColor="Corporate/Accent"
            textAlign="center"
          >
            {user?.status} &nbsp;
          </Box>
        </>
      )}
    </Stack>
  );
};

const AvatarWithRating = ({ user, ...rest }: { user: User } & BoxProps) => {
  const ctx = useContext(DrawerContext);
  const rating = user.avgRating ?? 0;

  if (!ctx.isOpen) {
    return <Avatar user={user} w="2.75rem" h="2.75rem" />;
  }

  return (
    <Box position="relative" {...rest}>
      <CircProgress
        className={css({ color: "Corporate/Accent" })}
        bgColor="#e0e0e0"
        progress={rating / 5}
        thickness={0.16}
      />
      <Center top="0" left="0" w="full" h="full" position="absolute">
        <Avatar user={user} w="4.5rem" h="4.5rem" />
        <RatingBadge rating={rating} />
      </Center>
    </Box>
  );
};

const RatingBadge = ({ rating, ...rest }: { rating: number } & BoxProps) => {
  const phi = (2 * Math.PI) / 11;
  const x = 50 + 50 * Math.cos(phi);
  const y = 50 + 50 * Math.sin(phi);

  const s = R.round(rating, 1).toFixed(1).replace(".", ",");

  return (
    <Box
      position="absolute"
      transform="translate(-50%, -50%)"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      bg="white"
      fontSize="body/S"
      color="Corporate/Accent"
      borderWidth="3px"
      borderColor="currentcolor"
      borderRadius="full"
      px={3}
      py={1}
      {...rest}
    >
      {s}
    </Box>
  );
};
