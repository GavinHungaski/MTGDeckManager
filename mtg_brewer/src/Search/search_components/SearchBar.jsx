import { useState } from "react";
import "./SearchBar.css";

function SearchBar({
  onSearch,
  colors = [],
  setColors = () => {},
  sortBy = "name",
  setSortBy = () => {},
  extraFilters = {},
  setExtraFilters = () => {},
}) {
  const [value, setValue] = useState("");

  function handleKeyDown(e) {
    if (e.key === "Enter") onSearch(value);
  }

  function setColor(color = "w") {
    const valid_colors = ["w", "u", "b", "g", "r"];
    setColors((prev) => {
      if (valid_colors.includes(color.toLowerCase())) {
        if (!prev.includes(color)) {
          return [...prev, color];
        } else {
          return prev.filter((n) => n !== color);
        }
      } else {
        return prev;
      }
    });
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
      <button onClick={() => onSearch(value)} className="search-button">
        <span className="button-top" style={{ background: "lightgreen" }}>
          Search
        </span>
      </button>
      <i className="ms ms-g"></i>
    </div>
  );
}

export default SearchBar;
