import React from "react";

import { Heading, Show, Stack, StackProps } from "@chakra-ui/react";

export interface SubsectionProps extends StackProps {
  title?: string;
}

export const Subsection = React.forwardRef<HTMLDivElement, SubsectionProps>(
  function Subsection(props, ref) {
    const { title, children, ...rest } = props;
    return (
      <Stack gap="10" ref={ref} {...rest}>
        <Show when={title}>
          <Heading as="h2" fontWeight="semibold" fontSize="larger">
            {title}
          </Heading>
        </Show>

        {children}
      </Stack>
    );
  },
);
