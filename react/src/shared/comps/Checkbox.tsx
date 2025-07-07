import React from "react";

import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";

export interface CheckboxProps extends ChakraCheckbox.RootProps {
  label?: string;
}

export const Checkbox = React.memo(function Checkbox({
  label,
  ...rest
}: { label?: string } & ChakraCheckbox.RootProps) {
  return (
    <ChakraCheckbox.Root gap={2} {...rest}>
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control
        w={4}
        h={4}
        borderRadius="small"
        borderColor="gray.1"
        _checked={{ bg: "blue.1", border: "none" }}
      />
      <ChakraCheckbox.Label fontSize="inherit">{label}</ChakraCheckbox.Label>
    </ChakraCheckbox.Root>
  );
});
