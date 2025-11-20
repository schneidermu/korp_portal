import { CloseButton, Dialog as D, Portal } from "@chakra-ui/react";

import { Button } from "./Button";
import { ReactNode } from "react";

export const Dialog = ({
  title,
  body,
  cancelText,
  actionText,
  onAction,
  onOpenChange,
  children,
  ...rest
}: {
  title: string;
  body: ReactNode;
  cancelText: string;
  actionText: string;
  onAction?: () => void;
} & D.RootProps) => {
  return (
    <D.Root lazyMount onOpenChange={onOpenChange} {...rest}>
      <D.Trigger asChild>{children}</D.Trigger>
      <Portal>
        <D.Backdrop />
        <D.Positioner>
          <D.Content>
            <D.Header bg="gray.9" px={7} py={5}>
              <D.Title fontSize="md">{title}</D.Title>
            </D.Header>
            <D.Body fontWeight="light">{body}</D.Body>
            <D.Footer justifyContent="start">
              <Button
                onClick={() => onOpenChange && onOpenChange({ open: false })}
                variant="solid"
              >
                {cancelText}
              </Button>
              <D.ActionTrigger asChild>
                <Button onClick={onAction} variant="outline">
                  {actionText}
                </Button>
              </D.ActionTrigger>
            </D.Footer>
            <D.CloseTrigger asChild>
              <CloseButton />
            </D.CloseTrigger>
          </D.Content>
        </D.Positioner>
      </Portal>
    </D.Root>
  );
};
