import { Box, BoxProps } from "@chakra-ui/react";

export const ShadowBox = (props: BoxProps) => {
  return (
    <Box
      borderRadius={1}
      boxShadow="2px 2px 5px 2px rgba(0, 0, 0, 0.1)"
      asChild
      {...props}
    />
  );
};
