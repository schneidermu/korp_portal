import { Show, Stack, StackProps } from "@chakra-ui/react";

export interface SectionProps extends StackProps {
  show?: boolean;
}

export const Section = ({ show = true, ...rest }: SectionProps) => {
  return (
    <Show when={show}>
      <Stack
        as="section"
        borderWidth={1}
        borderColor="gray.1"
        borderRadius="2"
        gap="12"
        px="7"
        py="9"
        {...rest}
      ></Stack>
    </Show>
  );
};
