import { Box, Heading, Separator, Stack } from "@chakra-ui/react";

import { NEXTCLOUD_PREFIX } from "@/app/const";

import { NewPage } from "@/features/App/comps/NewPage.tsx";

export const NextcloudPage = () => {
  return (
    <NewPage>
      <Stack gap="6" h="full">
        <Heading as="h1" fontSize="3xl" color="blue.4">
          Облачное хранилище
        </Heading>
        <Separator borderWidth={1} borderColor="gray.4" />
        <Box
          borderWidth={1}
          borderColor="gray.1"
          borderRadius="1"
          overflow="hidden"
          h="full"
        >
          <iframe width="100%" height="100%" src={NEXTCLOUD_PREFIX + "/"} />
        </Box>
      </Stack>
    </NewPage>
  );
};
