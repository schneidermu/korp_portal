import React from "react";
import { BoxProps, Box } from "@chakra-ui/react";

export const ShadowBox = React.forwardRef<HTMLDivElement, BoxProps>(
  function CardWrapper(props, ref) {
    return (
      <Box
        borderRadius={1}
        boxShadow="2px 2px 5px 2px rgba(0, 0, 0, 0.1)"
        asChild
        ref={ref}
        {...props}
      />
    );
  },
);
