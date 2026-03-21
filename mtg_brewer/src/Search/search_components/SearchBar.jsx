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

  const color_buttons = [
    { color: "w" },
    { color: "u" },
    { color: "b" },
    { color: "g" },
    { color: "r" },
    { color: "c" },
  ];

  function handleKeyDown(e) {
    if (e.key === "Enter") onSearch(value);
  }

  function setColor(color = "w") {
    const valid_colors = ["w", "u", "b", "g", "r", "c"];

    setColors((prev) => {
      if (valid_colors.includes(color.toLowerCase())) {
        if (color === "c" && !prev.includes(color)) {
          return ["c"];
        } else if (!prev.includes(color)) {
          return [...prev, color].filter((n) => n != "c");
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
      {color_buttons.map((cb) => {
        return (
          <button
            onClick={() => setColor(cb.color)}
            key={cb.color}
            className={colors.includes(cb.color) ? "" : "deselected"}
          >
            <i className={`ms ms-${cb.color} ms-cost ms-shadow`}></i>
          </button>
        );
      })}
      <button onClick={() => {}} className={"deselected"}>
        <i className="ms ms-multicolor ms-cost"></i>
      </button>
    </div>
  );
}

export default SearchBar;
