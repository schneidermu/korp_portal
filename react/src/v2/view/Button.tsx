import { css } from "@styled-system/css";
import { styled } from "@styled-system/jsx";

export type ButtonProps = Parameters<typeof styled.button>[0] & {
  variant?: "text" | "secondary" | "primary";
  size?: "S" | "M" | "L";
};

export const Button = ({
  variant = "primary",
  size = "M",
  ...rest
}: ButtonProps) => {
  if (variant === "primary") {
    return <ButtonPrimary size={size} {...rest} />;
  }
  if (variant === "secondary") {
    return <SecondaryButton size={size} {...rest} />;
  }
  return <TextButton size={size} {...rest} />;
};

const ButtonPrimary = (props: Omit<ButtonProps, "variant">) => {
  return (
    <SolidButton
      borderColor="Corporate/Accent"
      color="white"
      bg="Corporate/Accent"
      className={css({
        "&:hover:not([disabled])": {
          color: "Corporate/Accent",
          bg: "white",
        },
        "&:active:not([disabled])": {
          color: "white",
          bg: "Informing/Link",
          borderColor: "Informing/Link",
        },
        "&:disabled": {
          cursor: "default",
          bg: "Grayscale/Disabled",
          borderColor: "Grayscale/Disabled",
        },
      })}
      {...props}
    />
  );
};

const SecondaryButton: typeof ButtonPrimary = (props) => {
  return (
    <SolidButton
      borderColor="Corporate/Accent"
      color="Corporate/Accent"
      bg="white"
      className={css({
        "&:hover:not([disabled])": {
          color: "white",
          bg: "Corporate/Accent",
        },
        "&:active:not([disabled])": {
          color: "Informing/Link",
          bg: "white",
          borderColor: "Informing/Link",
        },
        "&:disabled": {
          cursor: "default",
          bg: "white",
          color: "Grayscale/Disabled",
          borderColor: "Grayscale/Disabled",
        },
      })}
      {...props}
    />
  );
};

const TextButton: typeof ButtonPrimary = (props) => {
  return (
    <BaseButton
      color="Corporate/Accent"
      className={css({
        "&:hover:not([disabled])": {
          color: "#5299F7", // FIXME
        },
        "&:active:not([disabled])": {
          color: "Informing/Link",
        },
        "&:disabled": {
          cursor: "default",
          color: "Grayscale/Disabled",
        },
      })}
      {...props}
    />
  );
};

const SolidButton: typeof ButtonPrimary = ({ size, ...rest }) => {
  return (
    <BaseButton
      borderRadius="Button"
      borderWidth={1}
      px={size === "L" ? 13 : size === "M" ? 7 : 3}
      py={size === "L" ? 3 : size === "M" ? 2 : 1}
      size={size}
      {...rest}
    />
  );
};

export const IconButton: typeof ButtonPrimary = (props) => {
  return (
    <BaseButton
      color={{ base: "Corporate/Accent", _disabled: "Grayscale/Disabled" }}
      {...props}
    />
  );
};

const BaseButton: typeof ButtonPrimary = ({ size, ...rest }) => {
  return (
    <styled.button
      cursor="pointer"
      // transition="all 0.2s"
      fontSize={size === "L" ? "18px" : size === "M" ? "16px" : "14px"}
      {...rest}
    />
  );
};
