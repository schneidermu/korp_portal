import { Link } from "react-router-dom";

import { BoxProps, HStack, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { Button } from "@ui/atoms/buttons";

export const HomeSection = ({
  heading,
  actionText,
  actionLink,
  children,
  ...rest
}: {
  heading: string;
  actionText: string;
  actionLink: string;
} & BoxProps) => {
  return (
    <styled.section className={stack({ gap: 6 })} {...rest}>
      <HStack justify="space-between">
        <styled.h1 fontSize="Headline/H2">{heading}</styled.h1>
        <Link to={actionLink}>
          <Button variant="text" size="L">
            {actionText}
          </Button>
        </Link>
      </HStack>
      {children}
    </styled.section>
  );
};
