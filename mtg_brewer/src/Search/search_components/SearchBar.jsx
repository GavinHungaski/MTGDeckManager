import { useRef } from "react";

function SearchBar({
  addResults,
  colors = [],
  sortBy = "name",
  extraFilters = {},
}) {
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

  function handleSearch(e) {
    const value = e.target.value;
    clearTimeout(debounceRef.current);
    if (value.length < 2) {
      addResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
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
    }, 350);
  }

  return (
    <div className="card-search">
      <input
        type="text"
        placeholder="Search cards . . ."
        onChange={handleSearch}
      />
    </div>
  );
}

export default SearchBar;
