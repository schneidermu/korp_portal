import { useEffect } from "react";
import { createPortal } from "react-dom";

import { Center, CenterProps, styled } from "@styled-system/jsx";

export interface OverlayProps
  extends Omit<CenterProps, "onClick" | "position" | "zIndex"> {
  isOpen: boolean;
  close: () => void;
  children?: React.ReactNode;
}

export const Overlay = ({ isOpen, close, children, ...rest }: OverlayProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, close]);

  if (!isOpen) return;

  const modal = (
    <Center
      bg="rgba(26, 20, 31, 0.3)"
      position="fixed"
      zIndex="overlay"
      inset="0"
      onClick={close}
      {...rest}
    >
      <styled.div
        onClick={(e) => e.stopPropagation()}
        maxH="90vh"
        overflowY="auto"
      >
        {children}
      </styled.div>
    </Center>
  );

  const root = document.getElementById("root")!;

  return createPortal(modal, root);
};
