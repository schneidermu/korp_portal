import { css } from "@styled-system/css";
import { Box, HStack, styled } from "@styled-system/jsx";

import { IconButton } from "@ui/atoms/buttons";
import { Overlay, OverlayProps } from "@ui/atoms/layout";

import { SaxCloseCircleLinear } from "@meysam213/iconsax-react";

interface ModalProps extends OverlayProps {
  heading?: string;
}

export const Modal = ({ close, children, heading, ...rest }: ModalProps) => {
  return (
    <Overlay close={close} {...rest}>
      <styled.article borderRadius="25px" p={6} w="38rem" bg="white">
        <HStack>
          {heading && (
            <styled.h1 fontSize="Headline/H3" fontWeight="semibold">
              {heading}
            </styled.h1>
          )}
          <Box flexGrow={1} />
          <IconButton color="Grayscale/Border" onClick={close}>
            <SaxCloseCircleLinear className={css({ w: 6, h: 6 })} />
          </IconButton>
        </HStack>
        <Box>{children}</Box>
      </styled.article>
    </Overlay>
  );
};
