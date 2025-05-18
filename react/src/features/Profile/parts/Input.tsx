import React from "react";

import {
  Input as ChakraInput,
  InputProps as ChakraInputProps,
} from "@chakra-ui/react";

import { FieldValue } from "./FieldValue";

export interface InputProps extends Omit<ChakraInputProps, "disabled"> {
  editing: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const { editing, ...rest } = props;

    return (
      <FieldValue editing={editing}>
        <ChakraInput disabled={!editing} ref={ref} {...rest} />
      </FieldValue>
    );
  },
);
