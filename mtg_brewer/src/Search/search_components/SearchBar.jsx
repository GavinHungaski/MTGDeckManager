import { useRef } from "react";

function SearchBar({ addResults, color_identity = [] }) {
  const debounceRef = useRef(null);

  function handleSearch(e) {
    const value = e.target.value;
    clearTimeout(debounceRef.current);

    if (value.length < 2) {
      addResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const identityString = color_identity.join("").toLowerCase();
        const query = encodeURIComponent(
          `!"${value}" OR ${value} ${color_identity.length === 0 ? "" : `id:${identityString}`} f:commander -is:digital`,
        );
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=${query}`,
        );
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
