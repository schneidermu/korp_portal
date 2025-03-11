import { Box, Grid } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import { DPA } from "@/features/dpa/comps/DPA";

import { NewNavBar } from "./NewNavBar";

export const NewPage = () => {
  return (
    <Box>
      <Grid pt="6" templateColumns="auto 1fr" gap="8">
        <Outlet />
        <Box height="fit" mt="20" position="sticky" top="10">
          <NewNavBar />
        </Box>
      </Grid>
      <DPA />
    </Box>
  );
};
