import { CSSProperties } from "react";

import { Tabs as T } from "@chakra-ui/react";

export const Tabs = ({
  tabs,
  ...rest
}: { tabs: { [key: string]: string } } & Omit<T.RootProps, "children">) => {
  const style = {
    "--indicator-color": "#2F80ED",
    "--indicator-thickness": "5px",
  } as CSSProperties;

  return (
    <T.Root colorPalette="blue.1" {...rest}>
      <T.List gap={28} borderBottomWidth={0}>
        {Object.entries(tabs).map(([value, name]) => (
          <T.Trigger
            key={value}
            value={value}
            borderColor="blue.1"
            color="gray.2"
            fontSize="larger"
            px={0}
            pb={3}
            style={style}
          >
            {name}
          </T.Trigger>
        ))}
      </T.List>
    </T.Root>
  );
};
