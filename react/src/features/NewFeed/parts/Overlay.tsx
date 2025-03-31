import React from "react";

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

export const Overlay = React.forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay(props, ref) {
    const { present, lazyMount, unmountOnExit, onClose, ...rest } = props;

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
        <Center w="full" h="full" onClick={() => onClose && onClose()}>
          <Box
            onClick={(event) => event.stopPropagation()}
            ref={ref}
            {...rest}
          />
        </Center>
      </Presence>
    );
  },
);
