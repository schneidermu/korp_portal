import clsx from "clsx";
import arrow from "/arrow.png";
import cross from "/cross.png";
import Overlay from "./Overlay";

import { motion } from "motion/react";
import { ReactNode } from "react";

const SlideButton = ({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) => {
  return (
    <button className="py-[40px]" onClick={onClick}>
      <img
        style={{ width: "83px", height: "83px" }}
        className={clsx(direction === "left" && "rotate-180")}
        src={arrow}
      />
    </button>
  );
};

const CloseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick}>
      <img style={{ width: "53px", height: "53px" }} src={cross} />
    </button>
  );
};

const Gallery = ({
  left,
  right,
  close,
  children,
}: {
  left: () => void;
  right: () => void;
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
            <SlideButton direction="left" onClick={left} />
          </div>
          <div className="bg-white">{children}</div>
          <div className="relative flex items-center">
            <div className="absolute right-[31px] top-[7px]">
              <CloseButton onClick={close} />
            </div>
            <SlideButton direction="right" onClick={right} />
          </div>
        </div>
      </motion.div>
    </Overlay>
  );
};

export default Gallery;
