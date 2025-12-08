import { createContext, useContext, useState } from "react";

import { BoxProps, Center, Grid, Stack, styled } from "@styled-system/jsx";

import { Button, ButtonProps } from "@ui/atoms/buttons";
import { Modal, ModalProps } from "../Modal";

export { PromptCoverDelete } from "./PromptCoverDelete";

export interface PromptProps extends Omit<ModalProps, "isOpen" | "close"> {
  kind: "success" | "delete";
  message: string;
  description: string;
  trigger: React.ReactNode;
}

interface PromptContextData {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const PromptContext = createContext<PromptContextData>({
  isOpen: false,
  setIsOpen: () => {},
});

export const PromptRoot = ({ children }: BoxProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PromptContext value={{ isOpen, setIsOpen }}>{children}</PromptContext>
  );
};

export const PromptModal = ({
  children,
  cover,
  heading,
  message,
}: {
  children?: React.ReactNode;
  cover?: React.ReactNode;
  heading: string;
  message: string;
}) => {
  const { isOpen, setIsOpen } = useContext(PromptContext);

  return (
    <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
      <Stack align="center" gap={3} my={11}>
        <Center>{cover}</Center>
        <styled.h2 fontSize="Headline/H3">{heading}</styled.h2>
        <styled.p
          color="Grayscale/HintText"
          fontWeight="light"
          textAlign="center"
        >
          {message}
        </styled.p>
      </Stack>
      <Grid gridAutoFlow="column">{children}</Grid>
    </Modal>
  );
};

export const PromptTrigger = ({ onClick, ...rest }: ButtonProps) => {
  const { setIsOpen } = useContext(PromptContext);

  return (
    <Button
      onClick={(e) => {
        setIsOpen(true);
        if (onClick) onClick(e);
      }}
      {...rest}
    />
  );
};

export const PromptAction = ({ onClick, ...rest }: ButtonProps) => {
  const { setIsOpen } = useContext(PromptContext);

  return (
    <Button
      onClick={(e) => {
        setIsOpen(false);
        if (onClick) onClick(e);
      }}
      {...rest}
    />
  );
};
