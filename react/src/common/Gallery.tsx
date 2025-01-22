import { ReactNode, useEffect } from "react";

import { SlideButton } from "./SlideButton";

import clsx from "clsx/lite";
import { motion } from "motion/react";

import { Icon } from "./Icon";

import cross from "/cross.png";

export const Modal = ({
  hidden = false,
  children,
}: {
  hidden?: boolean;
  children: ReactNode;
}) => {
  useEffect(() => {
    const html = document.documentElement;

    if (hidden) {
      html.style.overflow = "unset";
      html.style.paddingRight = "0";
    } else {
      const w1 = html.offsetWidth;
      html.style.overflow = "hidden";
      const w2 = html.offsetWidth;

      const scrollBarWidth = w2 - w1;

      html.style.paddingRight = `${scrollBarWidth}px`;
    }
  }, [hidden]);

  return <div hidden={hidden}>{children}</div>;
};

const Overlay = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={clsx(
        "fixed top-0 left-0 h-full w-full",
        "flex justify-center items-center",
        "bg-modal z-40",
      )}
    >
      {children}
    </motion.div>
  );
};

const CloseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick}>
      <Icon src={cross} width="53px" height="53px" />
    </button>
  );
};

export const Gallery = ({
  left,
  right,
  close,
  children,
  hideControls = false,
}: {
  left?: () => void;
  right?: () => void;
  close: () => void;
  children?: ReactNode;
  hideControls?: boolean;
}) => {
  return (
    <Overlay>
      <div className="py-[50px] w-full h-full max-w-[1639px] flex items-center">
        <div className="grid grid-cols-[83px,1fr,83px] gap-[35px] w-full h-fit">
          <div className="flex items-center">
            {hideControls || (
              <SlideButton direction="left" onClick={left} hide={!left} />
            )}
          </div>
          <div className="bg-white">{children}</div>
          <div className="relative flex items-center">
            {hideControls || (
              <>
                <div className="absolute right-[31px] top-[7px]">
                  <CloseButton onClick={close} />
                </div>
                <SlideButton direction="right" onClick={right} hide={!right} />
              </>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
};
