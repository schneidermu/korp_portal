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
        // _focusVisible={{outline: "blue.4"}}
        ref={ref}
        {...rest}
      >
        <Input
          placeholder="Поиск..."
          value={query}
          outlineColor="blue.2"
          _focusVisible={{borderColor: "blue.2"}}
          onChange={({ target }) => setQuery(target.value)}
        />
      </InputGroup>
    );
  },
);
