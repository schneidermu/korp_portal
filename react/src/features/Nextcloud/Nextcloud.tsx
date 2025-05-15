import { Box } from "@chakra-ui/react";

import { NEXTCLOUD_PREFIX } from "@/app/const";

import { NewPage } from "@/features/App/comps/NewPage.tsx";

export const NextcloudPage = () => {
  return (
    <NewPage>
      <Box
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="1"
        overflow="hidden"
      >
        <iframe width="100%" height="100%" src={NEXTCLOUD_PREFIX + "/"} />
      </Box>
    </NewPage>
  );
};
