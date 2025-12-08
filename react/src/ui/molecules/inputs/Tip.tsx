import { Box, BoxProps } from "@styled-system/jsx";

export const Tip = (props: BoxProps) => {
  return (
    <Box
      alignSelf="end"
      fontSize="Body/XS"
      color="Grayscale/Border"
      {...props}
    />
  );
};
