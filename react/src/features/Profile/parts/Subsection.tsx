import { Heading, Show, Stack, StackProps } from "@chakra-ui/react";

export interface SubsectionProps extends StackProps {
  show?: boolean;
  title?: string;
}

export const Subsection = ({
  show = true,
  title,
  children,
  ...rest
}: SubsectionProps) => {
  return (
    <Show when={show}>
      <Stack gap="10" {...rest}>
        <Show when={title}>
          <Heading as="h2" fontWeight="semibold" fontSize="larger">
            {title}
          </Heading>
        </Show>

        {children}
      </Stack>
    </Show>
  );
};
