import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const SlideButton = (props: IconButtonProps) => {
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
      {...props}
    ></IconButton>
  );
};

export const SlideButtonLeft = (props: IconButtonProps) => {
  return (
    <SlideButton right="100%" {...props}>
      <LuChevronLeft style={{ width: "100%", height: "100%" }} />
    </SlideButton>
  );
};

export const SlideButtonRight = (props: IconButtonProps) => {
  return (
    <SlideButton left="100%" {...props}>
      <LuChevronRight style={{ width: "100%", height: "100%" }} />
    </SlideButton>
  );
};
