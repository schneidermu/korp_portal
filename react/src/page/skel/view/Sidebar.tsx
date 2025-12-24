import { useContext } from "react";

import { Link } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, Stack, styled } from "@styled-system/jsx";

import { useFetchUser } from "@api/user";
import { Avatar } from "@ui/atoms/media";
import { AvatarWithRating } from "@ui/molecules/media";

import { Drawer, DrawerContext } from "@ui/molecules/navigation";
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
          {ctx.isOpen ? (
            <AvatarWithRating user={user} w={24} h={24} />
          ) : (
            <Avatar user={user} w="2.75rem" h="2.75rem" />
          )}
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
