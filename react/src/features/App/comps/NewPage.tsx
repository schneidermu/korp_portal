import { ReactNode } from "react";

import { Box, Grid, Separator, Show } from "@chakra-ui/react";

import { DPA } from "@/features/dpa/comps/DPA";

export const NewPage = ({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar?: ReactNode;
}) => {
  return (
    <Box>
      <Grid pt="6" templateColumns="auto 1fr" gap="8" w="fit" mx="auto">
        <Box position="relative" w={1440} p="9" pb="20" minH="100vh">
          {children}
        </Box>
        <Box height="fit" mt="20" position="sticky" top="10">
          <Show when={sidebar}>
            <Separator borderWidth={1} my={8} />
            {sidebar}
          </Show>
        </Box>
      </Grid>
      <DPA />
    </Box>
  );
};
