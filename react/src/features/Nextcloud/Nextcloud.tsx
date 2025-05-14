import { Box } from "@chakra-ui/react";

import { NEXTCLOUD_PREFIX } from "@/app/const";

import { NewPage } from "@/features/App/comps/NewPage.tsx";
import { AnimatePage } from "@/features/App/comps/PageSkel";

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

export const Nextcloud = () => {
  return (
    <AnimatePage>
      <Box
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="1"
        overflow="hidden"
      >
        <iframe width="100%" height="1200px" src={NEXTCLOUD_PREFIX + "/"} />
      </Box>
    </AnimatePage>
  );
};
