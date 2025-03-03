import clsx from "clsx/lite";

import { Icon } from "./Icon";

import crossIcon from "@/assets/cross.svg";
import searchIcon from "@/assets/search.svg";

const QueryTerm = ({
  term,
  handleClick,
}: {
  term: string;
  handleClick?: () => void;
}) => {
  return (
    <div
      className="flex gap-1 cursor-pointer bg-light-gray px-3 py-1 rounded"
      onClick={handleClick}
    >
      <span>{term}</span>
      <Icon src={crossIcon} width="0.8em" height="0.8em" />
    </div>
  );
};

export const SearchBar = ({
  query,
  setQuery,
}: {
  query: string[];
  setQuery: (query: string[]) => void;
}) => {
  const enterTerm = () => {
    setQuery([...query, ""]);
  };

  return (
    <div>
      <div
        className={clsx(
          "px-[44px] py-[8px]",
          "flex items-center gap-[16px]",
          "rounded border-[4px] border-light-gray",
        )}
      >
        <button onClick={enterTerm}>
          <Icon src={searchIcon} width="40px" height="40px" />
        </button>
        <input
          autoFocus
          className={clsx(
            "w-full text-[30px]",
            "placeholder:text-medium-gray placeholder:font-medium",
            "focus:outline-none",
          )}
          type="search"
          placeholder="Поиск..."
          value={query[query.length - 1] || ""}
          onChange={({ target: { value } }) =>
            setQuery([...query.slice(0, -1), value])
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              enterTerm();
            }
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2 ml-4 mt-2">
        {query.slice(0, -1).map((term, i) => (
          <QueryTerm
            key={term}
            term={term}
            handleClick={() =>
              setQuery([...query.slice(0, i), ...query.slice(i + 1)])
            }
          />
        ))}
      </div>
    </div>
  );
};
