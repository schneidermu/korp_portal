import { Outlet } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";

import { system } from "../theme";

export const ChakraWrapper = () => {
  return (
    <ChakraProvider value={system}>
      <Outlet />
    </ChakraProvider>
  );
};
