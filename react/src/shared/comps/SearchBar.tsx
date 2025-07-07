import { Input, InputGroup, InputGroupProps } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

import { useDebounceState } from "@/shared/hooks/useDebounce";

export const SearchBar = function SearchBar({
  debounceDelay,
  onDebounce,
  ...rest
}: {
  debounceDelay: number;
  onDebounce: (q: string) => void;
} & Omit<InputGroupProps, "children">) {
  const [query, setQuery] = useDebounceState<string>(
    "",
    debounceDelay,
    onDebounce,
  );

  return (
    <InputGroup
      h="fit"
      startElement={<LuSearch />}
      borderWidth={1}
      borderRadius="small"
      borderColor="gray.1"
      // _focusVisible={{outline: "blue.4"}}
      {...rest}
    >
      <Input
        placeholder="Поиск..."
        value={query}
        outlineColor="blue.2"
        _focusVisible={{ borderColor: "blue.2" }}
        onChange={({ target }) => setQuery(target.value)}
      />
    </InputGroup>
  );
};
