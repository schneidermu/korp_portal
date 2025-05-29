import React from "react";

import { Flex, Heading, Separator, Stack, StackProps } from "@chakra-ui/react";

export interface PageHeadingProps extends StackProps {
  title?: string;
}

export const PageHeading = React.memo(
  React.forwardRef<HTMLDivElement, PageHeadingProps>(
    function PageHeading(props, ref) {
      const { title, children, ...rest } = props;

      return (
        <Stack gap={4} mb={4} ref={ref} {...rest}>
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
    },
  ),
);
