import { Outlet } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, Flex, Grid, Stack } from "@styled-system/jsx";

import { useLogin } from "@/features/auth/services";

import { DPA } from "@/features/dpa/comps/DPA";

import { Sidebar } from "./view/Sidebar";
import { Navbar } from "./view/Navbar";

export default function Skel() {
  const auth = useLogin();
  const isDev = import.meta.env.DEV;

  if (!auth.isLoggedIn) return;

  return (
    <Grid
      gridTemplateColumns={isDev ? "50px auto 1fr auto" : "auto 1fr auto"}
      gap={0}
    >
      {isDev && <LiferayHeader />}
      {isDev && <Box bg="#D9D9D9" />}
      <Navbar />
      <Stack w="full" mx="auto" px={6} py={8} gap={9}>
        <Outlet />
      </Stack>
      <Sidebar />
      <DPA />
    </Grid>
  );
}

const LiferayHeader = () => {
  // TODO: is there a vite root var?
  const url = new URL("../../../../public/dev/logo.png", import.meta.url).href;

  return (
    <Flex
      bg="Corporate/Accent"
      color="white"
      px={5}
      h="50px"
      w="full"
      position="sticky"
      top="0"
      gridColumn="span 4"
      align="center"
      zIndex={10}
    >
      <img src={url} className={css({ h: "33px" })} />
    </Flex>
  );
};
