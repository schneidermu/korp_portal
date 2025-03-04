import React from "react";

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props: ButtonProps) {
    return (
      <ChakraButton
        px="5"
        py="2"
        color="white"
        bg="blue.1"
        fontWeight="semibold"
        borderRadius="1"
        {...props}
      ></ChakraButton>
    );
  },
);
