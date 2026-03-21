import { useState } from "react";

function SearchBar({
  onSearch,
  colors = [],
  sortBy = "name",
  extraFilters = {},
}) {
  const [value, setValue] = useState("");

  function handleKeyDown(e) {
    if (e.key === "Enter") onSearch(value);
  }

  return (
    <div className="card-search">
      <input
        type="text"
        value={value}
        placeholder="Search cards . . ."
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={() => onSearch(value)}>
        <span className="button-top" style={{ background: "lightgreen" }}>
          Search
        </span>
      </button>
    </div>
  );
}

export default SearchBar;
