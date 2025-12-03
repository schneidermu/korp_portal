import { Select as ChakraSelect } from "@chakra-ui/react";
import { FieldValue } from "./FieldValue";

export type Item = { value: string; label: string };

export const Select = ({
  editing,
  collection,
  ...rest
}: { editing?: boolean } & Omit<ChakraSelect.RootProps<Item>, "disabled">) => {
  return (
    <ChakraSelect.Root disabled={!editing} collection={collection} {...rest}>
      <FieldValue editing={editing}>
        <ChakraSelect.Trigger>
          <ChakraSelect.ValueText />
        </ChakraSelect.Trigger>
      </FieldValue>
      <ChakraSelect.Positioner w="full">
        <ChakraSelect.Content>
          {collection.items.map((item) => (
            <ChakraSelect.Item key={item.value} item={item} fontSize="smaller">
              {item.label}
            </ChakraSelect.Item>
          ))}
        </ChakraSelect.Content>
      </ChakraSelect.Positioner>
    </ChakraSelect.Root>
  );
};
