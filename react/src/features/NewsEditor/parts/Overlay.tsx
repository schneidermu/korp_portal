import { useEffect } from "react";

import {
  Box,
  BoxProps,
  Center,
  Presence,
  PresenceProps,
} from "@chakra-ui/react";

export type OverlayProps = BoxProps &
  Pick<PresenceProps, "present" | "lazyMount" | "unmountOnExit"> & {
    onClose?: () => void;
  };

export const Overlay = function Overlay({
  present,
  lazyMount,
  unmountOnExit,
  onClose,
  ...rest
}: OverlayProps) {
  useEffect(() => {
    const handleKeyDown = ({ key }: KeyboardEvent) => {
      if (key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <Presence
      present={present}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      animationName={{ _open: "fade-in", _closed: "fade-out" }}
      animationDuration="slow"
      position="fixed"
      zIndex={1}
      w="full"
      h="full"
      top="0"
      left="0"
      background="gray.1/65"
    >
      <Center
        w="full"
        h="full"
        onClick={() => onClose && onClose()}
        onKeyDown={({ key }) => {
          if (key === "Escape" && onClose) {
            onClose();
          }
        }}
      >
        <Box onClick={(event) => event.stopPropagation()} {...rest} />
      </Center>
    </Presence>
  );
};
