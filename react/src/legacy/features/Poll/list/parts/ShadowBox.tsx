import { Box, BoxProps } from "@chakra-ui/react";

export const ShadowBox = (props: BoxProps) => {
  return (
    <Box
      asChild
      borderRadius="1"
      shadow="0 0 5px 0 rgba(0, 0, 0, 0.2)"
      {...props}
    />
  );
};
