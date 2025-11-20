import { useCallback, useContext, useState } from "react";

import { HTMLMotionProps, motion } from "motion/react";

import { css } from "@styled-system/css";

import { OpenButton, OpenButtonProps } from "./OpenButton";
import { DrawerContext } from "./context";

export const Drawer = ({
  openedWidth,
  closedWidth,
  side,
  duration,
  ...rest
}: {
  openedWidth: string;
  closedWidth: string;
  side: "left" | "right";
  duration: number;
} & HTMLMotionProps<"div">) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggle = useCallback(() => {
    if (isAnimating) return;
    setIsOpen((isOpen) => !isOpen);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000 * duration);
  }, [duration, isAnimating]);

  return (
    <DrawerContext
      value={{
        isOpen,
        isAnimating,
        duration,
      }}
    >
      <DrawerWrapper
        openedWidth={openedWidth}
        closedWidth={closedWidth}
        side={side}
        toggle={toggle}
        {...rest}
      />
    </DrawerContext>
  );
};

const DrawerWrapper = ({
  openedWidth,
  closedWidth,
  side,
  toggle,
  children,
  ...rest
}: {
  openedWidth: string;
  closedWidth: string;
  side: OpenButtonProps["side"];
  toggle: () => void;
} & HTMLMotionProps<"div">) => {
  const ctx = useContext(DrawerContext);

  return (
    <motion.div
      animate={{ width: ctx.isOpen ? openedWidth : closedWidth }}
      transition={{ duration: ctx.duration }}
      className={css({
        w: "18rem",
        h: "calc(100vh - 57px)",
        minH: "52rem",
        position: "sticky",
        shadow: "Sidebar",
      })}
      {...rest}
    >
      <OpenButton
        isOpen={ctx.isOpen}
        side={side}
        position="absolute"
        right={side === "left" ? 0 : undefined}
        left={side === "right" ? 0 : undefined}
        top={10}
        p={2}
        transform={side === "left" ? "translate(50%, 0)" : "translate(-50%, 0)"}
        bg="white"
        borderRadius="full"
        onClick={toggle}
      />
      {children as React.ReactNode}
    </motion.div>
  );
};
