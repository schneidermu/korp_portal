import React from "react";

import { Stack, StackProps } from "@chakra-ui/react";

export const Section = React.forwardRef<HTMLDivElement, StackProps>(
  function Section(props, ref) {
    return (
      <Stack
        as="section"
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="2"
        gap="12"
        px="7"
        py="9"
        ref={ref}
        {...props}
      ></Stack>
    );
  },
);
