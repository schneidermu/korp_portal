import { Box, BoxProps } from "@chakra-ui/react";

export interface FieldValueProps extends BoxProps {
  editing?: boolean;
}

export const FieldValue = (props: FieldValueProps) => {
  const { editing, ...rest } = props;

  return (
    <Box
      asChild
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
            fontSize: { lg: "md", xl: "xl" },
            borderWidth: 0,
            pl: 0,
            cursor: "auto",
          })}
      {...rest}
    />
  );
};
