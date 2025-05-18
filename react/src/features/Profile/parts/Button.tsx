import React from "react";

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const { variant, ...rest } = props;

    let theme: Partial<ButtonProps> = {};
    switch (variant) {
      case "solid":
        theme = { color: "white", bg: "blue.1" };
        break;
      case "outline":
        // theme = { };
        break;
      case "ghost":
        theme = { borderColor: "transparent" };
        break;
    }

    return (
      <ChakraButton
        ref={ref}
        px="5"
        py="2"
        fontWeight="semibold"
        borderRadius="1"
        borderWidth={1}
        color="blue.1"
        borderColor="blue.1"
        {...theme}
        {...rest}
      ></ChakraButton>
    );
  },
);
