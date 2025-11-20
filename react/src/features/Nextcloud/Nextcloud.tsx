import { Box, Stack } from "@chakra-ui/react";

import { NEXTCLOUD_PREFIX } from "@/app/const";

import { Page } from "@/features/App/comps/Page";
import { PageHeading } from "@/features/App/comps/PageHeading.tsx";

export default function NextcloudPage() {
  return (
    <Page>
      <Stack gap="6" h="full">
        <PageHeading title="Облачное хранилище" />
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
    </Page>
  );
}
