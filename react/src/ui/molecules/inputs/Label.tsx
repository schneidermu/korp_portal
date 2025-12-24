import { Box, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

type StyledLabelProps = Parameters<typeof styled.label>[0];

export interface LabelProps extends StyledLabelProps {
  label?: string;
}

export const Label = ({ label, children, ...rest }: LabelProps) => {
  return (
    <styled.label className={stack({ gap: 1 })} {...rest}>
      {label && (
        <Box fontSize="Body/M" fontWeight="semibold">
          {label}
        </Box>
      )}
      {children}
    </styled.label>
  );
};
