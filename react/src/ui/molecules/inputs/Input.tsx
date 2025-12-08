import { styled } from "@styled-system/jsx";

export interface InputProps
  extends Omit<Parameters<typeof styled.input>[0], "value" | "onChange"> {
  text: string;
  setText: (text: string) => void;
}

export const Input = ({ text, setText, ...rest }: InputProps) => {
  return (
    <styled.input
      borderRadius="8px"
      borderWidth="1px"
      borderColor="Grayscale/SpacerLight"
      value={text}
      onChange={(e) => setText(e.target.value)}
      p={3}
      {...rest}
    />
  );
};
