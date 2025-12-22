import { Box, Stack, styled } from "@styled-system/jsx";

import { NEXTCLOUD_PREFIX } from "@app/const";

import { Breadcrumbs } from "@ui/molecules/navigation";

export default function NextcloudPage() {
  return (
    <Stack gap={8} h="full">
      <Stack gap={4}>
        <Breadcrumbs />
        <styled.h1 fontSize="Headline/H1">Облачное хранилище</styled.h1>
      </Stack>
      <Box
        borderWidth={1}
        borderColor="Grayscale/SpacerLight"
        borderRadius="8px"
        overflow="hidden"
        h="full"
      >
        <iframe width="100%" height="100%" src={NEXTCLOUD_PREFIX + "/"} />
      </Box>
    </Stack>
  );
}
