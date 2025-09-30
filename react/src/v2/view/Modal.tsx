// TODO: refactor me

import { Center, styled } from "@styled-system/jsx";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <Center
      bg="rgba(26, 20, 31, 0.3)"
      position="fixed"
      zIndex="1000" // FIXME
      inset="0"
      onClick={onClose}
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

  return createPortal(modal, document.body);
};
