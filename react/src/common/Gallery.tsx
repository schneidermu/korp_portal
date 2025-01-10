import { ReactNode } from "react";

import { motion } from "motion/react";

import { noop } from "./util";

import { Overlay } from "./Overlay";
import { SlideButton } from "./SlideButton";

import cross from "/cross.png";

const CloseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick}>
      <img style={{ width: "53px", height: "53px" }} src={cross} />
    </button>
  );
};

export const Gallery = ({
  left,
  right,
  close,
  children,
}: {
  left?: () => void;
  right?: () => void;
  close: () => void;
  children?: ReactNode;
}) => {
  return (
    <Overlay>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="py-[50px] w-full h-full max-w-[1639px] flex items-center"
      >
        <div className="grid grid-cols-[83px,1fr,83px] gap-[35px] w-full h-fit">
          <div className="flex items-center">
            <SlideButton direction="left" onClick={left || noop} hide={!left} />
          </div>
          <div className="bg-white">{children}</div>
          <div className="relative flex items-center">
            <div className="absolute right-[31px] top-[7px]">
              <CloseButton onClick={close} />
            </div>
            <SlideButton
              direction="right"
              onClick={right || noop}
              hide={!right}
            />
          </div>
        </div>
      </motion.div>
    </Overlay>
  );
};
