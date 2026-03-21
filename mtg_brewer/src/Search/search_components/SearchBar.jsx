import { useRef, useState } from "react";

function SearchBar({
  addResults,
  colors = [],
  sortBy = "name",
  extraFilters = {},
}) {
  const [value, setValue] = useState("");
  const debounceRef = useRef(null);

  function buildQuery(searchText) {
    const parts = [];

    if (searchText.length >= 2) {
      parts.push(`!"${searchText}" OR ${searchText}`);
    }

    if (colors.length > 0) {
      parts.push(`id:${colors.join("").toLowerCase()}`);
    }

    if (extraFilters.type) {
      parts.push(`t:${extraFilters.type}`);
    }

    parts.push("f:commander -is:digital");

    return `https://api.scryfall.com/cards/search?q=${encodeURIComponent(parts.join(" "))}&order=${sortBy}`;
  }

  async function runSearch() {
    if (value.length < 2) return;
    try {
      const response = await fetch(buildQuery(value));
      if (!response.ok) throw new Error("Scryfall error");
      const data = await response.json();
      const sorted = data.data.sort((a, b) => {
        const aExact = a.name.toLowerCase() === value.toLowerCase();
        const bExact = b.name.toLowerCase() === value.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      });
      addResults(sorted.slice(0, 10));
    } catch {
      addResults([]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") runSearch();
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
      <button onClick={runSearch}>
        <span className="button-top" style={{ background: "lightgreen" }}>
          Search
        </span>
      </button>
    </div>
  );
}

export default SearchBar;
