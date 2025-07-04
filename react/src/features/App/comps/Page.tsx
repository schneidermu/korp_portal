import { ReactNode } from "react";

import { Box, HStack, Separator, Show } from "@chakra-ui/react";

import { DPA } from "@/features/dpa/comps/DPA";

import { NavBar } from "../parts/NavBar";

export const Page = ({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
}) => {
  return (
    <HStack maxW="90rem" w="full" mx="auto" px={6} pt="6" gap={16} align="top">
      <Box
        // Quick fix, allows to size overflowing UserTree and polls correctly.
        maxW="80%"
        minH="90vh"
        flexGrow={1}
        position="relative"
        pt={9}
        pb={20}
      >
        {children}
      </Box>
      {/* Box makes sticky work */}
      <Box>
        <Box
          w={{ lg: "9.5rem", xl: "11.5rem" }}
          flexShrink={0}
          mt={20}
          position="sticky"
          top={20}
        >
          <NavBar fontSize={{ lg: "xl", xl: "2xl" }} />
          <Show when={sidebar}>
            <Separator borderWidth={1} my={8} />
            {sidebar}
          </Show>
        </Box>
      </Box>
      <DPA />
    </HStack>
  );
};
