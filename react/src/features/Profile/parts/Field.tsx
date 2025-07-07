import { Field as ChakraField, Text } from "@chakra-ui/react";

export interface FieldProps extends ChakraField.RootProps {
  label: string;
  editing: boolean;
}

export const Field = ({ label, editing, children, ...rest }: FieldProps) => {
  return (
    <ChakraField.Root gap={editing ? "2" : "3"} {...rest}>
      <ChakraField.Label ml={editing ? "3" : undefined} textWrap="nowrap">
        <Text color="gray.2" fontSize={editing ? "smaller" : "md"}>
          {label}
        </Text>
      </ChakraField.Label>
      {children}
    </ChakraField.Root>
  );
};
