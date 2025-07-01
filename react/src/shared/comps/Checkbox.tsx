import React from "react";

import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";

export interface CheckboxProps extends ChakraCheckbox.RootProps {
  label?: string;
}

export const Checkbox = React.memo(
  React.forwardRef<HTMLLabelElement, CheckboxProps>(
    function Checkbox(props, ref) {
      const { label, ...rest } = props;

      return (
        <ChakraCheckbox.Root gap={2} ref={ref} {...rest}>
          <ChakraCheckbox.HiddenInput />
          <ChakraCheckbox.Control
            w={4}
            h={4}
            borderRadius="small"
            borderColor="gray.1"
            _checked={{ bg: "blue.1", border: "none" }}
          />
          <ChakraCheckbox.Label fontSize="inherit">
            {label}
          </ChakraCheckbox.Label>
        </ChakraCheckbox.Root>
      );
    },
  ),
);
