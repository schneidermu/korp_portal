import clsx from "clsx/lite";

import crossIcon from "/cross.svg";
import searchIcon from "/search.svg";

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
      <img src={crossIcon} style={{ width: "0.8em", height: "0.8em" }} />
    </div>
  );
};

export const SearchBar = ({
  query,
  setQuery,
}: {
  query: string[];
  setQuery: (args: { query: string[]; reload: boolean }) => void;
}) => {
  const addTerm = () => {
    setQuery({ query: [...query, ""], reload: true });
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
        <button onClick={addTerm}>
          <img
            src={searchIcon}
            style={{ width: "40px", height: "40px" }}
            draggable={false}
          />
        </button>
        <input
          className={clsx(
            "w-full text-[30px]",
            "placeholder:text-medium-gray placeholder:font-medium",
            "focus:outline-none",
          )}
          type="search"
          placeholder="Поиск..."
          value={query[query.length - 1]}
          onChange={(event) => {
            setQuery({
              query: [...query.slice(0, -1), event.target.value],
              reload: false,
            });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              addTerm();
            }
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2 ml-4 mt-2">
        {query.slice(0, -1).map((term, i) => (
          <QueryTerm
            key={term}
            term={term}
            handleClick={() => {
              setQuery({
                query: [...query.slice(0, i), ...query.slice(i + 1)],
                reload: true,
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};
