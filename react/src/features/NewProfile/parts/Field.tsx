import React from "react";

import { Field as ChakraField, Text } from "@chakra-ui/react";

export interface FieldProps extends ChakraField.RootProps {
  label: string;
  editing: boolean;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  function Field(props, ref) {
    const { label, editing, children, ...rest } = props;
    return (
      <ChakraField.Root gap={editing ? "2" : "3"} ref={ref} {...rest}>
        <ChakraField.Label ml={editing ? "3" : undefined}>
          <Text color="gray.2" fontSize={editing ? "smaller" : "md"}>
            {label}
          </Text>
        </ChakraField.Label>
        {children}
      </ChakraField.Root>
    );
  },
);
