import React from "react";

import { Flex, Heading, Separator, Stack, StackProps } from "@chakra-ui/react";

export const PageHeading = React.memo(function PageHeading({
  title,
  children,
  ...rest
}: { title?: string } & StackProps) {
  return (
    <Stack gap={4} mb={4} {...rest}>
      <Flex justify="space-between">
        {title && (
          <Heading as="h1" fontSize="3xl" color="blue.4">
            {title}
          </Heading>
        )}
        {children}
      </Flex>
      <Separator color="gray.4" />
    </Stack>
  );
});
