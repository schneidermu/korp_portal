import { styled } from "@styled-system/jsx";

type StyledTextareaProps = Parameters<typeof styled.textarea>[0];

export interface TextareaProps
  extends Omit<StyledTextareaProps, "value" | "onChange"> {
  text: string;
  setText: (text: string) => void;
}

export const Textarea = ({ text, setText, ...rest }: TextareaProps) => {
  return (
    <styled.textarea
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
