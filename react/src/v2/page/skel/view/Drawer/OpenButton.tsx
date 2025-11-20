import { css } from "@styled-system/css";
import { styled } from "@styled-system/jsx";

import {
  SaxArrowLeft1Linear,
  SaxArrowRight1Linear,
} from "@meysam213/iconsax-react";

import { IconButton } from "@view/Button";

export type OpenButtonProps = Parameters<typeof styled.button>[0] & {
  side: "left" | "right";
  isOpen: boolean;
};

export const OpenButton = ({ side, isOpen, ...rest }: OpenButtonProps) => {
  const left = side === "left";

  return (
    <IconButton
      p={2}
      borderRadius="full"
      shadow="M"
      borderWidth="1px"
      bg={{
        base: "white",
        _hover: "#EFF6FF" /* FIXME */,
        _active: "Corporate/Accent",
      }}
      borderColor={{
        base: "Grayscale/SpacerLight",
        _hover: "#EFF6FF" /* FIXME */,
        _active: "Corporate/Accent",
      }}
      color={{
        base: "Grayscale/Black",
        _hover: "Corporate/Accent" /* FIXME */,
        _active: "white",
      }}
      {...rest}
    >
      {(left && isOpen) || (!left && !isOpen) ? (
        <SaxArrowLeft1Linear className={css({ w: 3, h: 3 })} />
      ) : (
        <SaxArrowRight1Linear className={css({ w: 3, h: 3 })} />
      )}
    </IconButton>
  );
};
