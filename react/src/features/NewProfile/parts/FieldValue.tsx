import React from "react";

import { Box, BoxProps } from "@chakra-ui/react";

export interface FieldValueProps extends BoxProps {
  editing?: boolean;
}

export const FieldValue = React.forwardRef<HTMLDivElement, FieldValueProps>(
  function FieldValue(props, ref) {
    const { editing, ...rest } = props;

    return (
      <Box
        asChild
        ref={ref}
        h="inherit"
        minH="inherit"
        outline="none"
        pr="3"
        pb="2"
        color="black"
        opacity="1"
        {...(editing
          ? {
              pl: "3",
              pt: "2",
              borderWidth: 1,
              borderColor: "gray.1",
              borderRadius: "2",
              fontSize: "smaller",
            }
          : {
              fontSize: "xl",
            })}
        {...rest}
      />
    );
  },
);
