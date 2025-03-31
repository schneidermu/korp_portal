import React from "react";

import { Input, InputGroup, InputGroupProps } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

import { useDebounceState } from "@/shared/hooks/useDebounce";

export interface SearchBarProps extends Omit<InputGroupProps, "children"> {
  debounceDelay: number;
  onDebounce: (q: string) => void;
}

export const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(
  function SearchBar(props, ref) {
    const { debounceDelay, onDebounce, ...rest } = props;

    const [query, setQuery] = useDebounceState<string>(
      "",
      debounceDelay,
      onDebounce,
    );

    return (
      <InputGroup
        startElement={<LuSearch />}
        borderWidth={1}
        borderRadius="small"
        borderColor="gray.1"
        ref={ref}
        {...rest}
      >
        <Input
          placeholder="Поиск..."
          value={query}
          onChange={({ target }) => setQuery(target.value)}
        />
      </InputGroup>
    );
  },
);
