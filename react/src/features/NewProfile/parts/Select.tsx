import React from "react";

import { Select as ChakraSelect } from "@chakra-ui/react";
import { FieldValue } from "./FieldValue";

export type Item = { value: string; label: string };

export interface SelectProps
  extends Omit<ChakraSelect.RootProps<Item>, "disabled"> {
  editing?: boolean;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  function Select(props, ref) {
    const { editing, collection, ...rest } = props;

    return (
      <ChakraSelect.Root
        disabled={!editing}
        collection={collection}
        defaultValue={["В отпуске"]}
        ref={ref}
        {...rest}
      >
        <FieldValue editing={editing}>
          <ChakraSelect.Trigger>
            <ChakraSelect.ValueText />
          </ChakraSelect.Trigger>
        </FieldValue>
        <ChakraSelect.Positioner w="full">
          <ChakraSelect.Content>
            {collection.items.map((item) => (
              <ChakraSelect.Item
                key={item.value}
                item={item}
                fontSize="smaller"
              >
                {item.label}
              </ChakraSelect.Item>
            ))}
          </ChakraSelect.Content>
        </ChakraSelect.Positioner>
      </ChakraSelect.Root>
    );
  },
);
