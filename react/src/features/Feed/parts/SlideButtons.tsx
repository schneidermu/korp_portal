import React from "react";

import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const SlideButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function SlideButton(props, ref) {
    return (
      <IconButton
        position="absolute"
        w="10"
        h="50%"
        top="50%"
        transform="translateY(-50%)"
        bg="transparent"
        color="black"
        _hover={{ color: "blue.2" }}
        ref={ref}
        {...props}
      ></IconButton>
    );
  },
);

export const SlideButtonLeft = React.forwardRef<
  HTMLButtonElement,
  IconButtonProps
>(function SlideButtonLeft(props, ref) {
  return (
    <SlideButton right="100%" ref={ref} {...props}>
      <LuChevronLeft style={{ width: "100%", height: "100%" }} />
    </SlideButton>
  );
});

export const SlideButtonRight = React.forwardRef<
  HTMLButtonElement,
  IconButtonProps
>(function SlideButtonRight(props, ref) {
  return (
    <SlideButton left="100%" ref={ref} {...props}>
      <LuChevronRight style={{ width: "100%", height: "100%" }} />
    </SlideButton>
  );
});
