import React from "react";

import { Show, Stack, StackProps } from "@chakra-ui/react";

export interface SectionProps extends StackProps {
  show?: boolean;
}

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  function Section(props, ref) {
    const { show = true } = props;

    return (
      <Show when={show}>
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
      </Show>
    );
  },
);
