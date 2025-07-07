import {
  Input as ChakraInput,
  InputProps as ChakraInputProps,
} from "@chakra-ui/react";

import { FieldValue } from "./FieldValue";

export const Input = ({
  editing,
  ...rest
}: { editing: boolean } & Omit<ChakraInputProps, "disabled">) => {
  return (
    <FieldValue editing={editing}>
      <ChakraInput disabled={!editing} {...rest} />
    </FieldValue>
  );
};
