import { ButtonProps, Button as ChakraButton } from "@chakra-ui/react";

export const Button = ({ variant, ...rest }: ButtonProps) => {
  let theme: Partial<ButtonProps> = {};
  switch (variant) {
    case "solid":
      theme = { color: "white", bg: "blue.1" };
      break;
    case "outline":
      theme = { background: "transparent" };
      break;
    case "ghost":
      theme = { borderColor: "transparent", bg: "transparent" };
      break;
  }

  return (
    <ChakraButton
      px="5"
      py="2"
      fontSize="md"
      fontWeight="semibold"
      borderRadius="1"
      borderWidth={1}
      color="blue.1"
      borderColor="blue.1"
      {...theme}
      {...rest}
    ></ChakraButton>
  );
};
