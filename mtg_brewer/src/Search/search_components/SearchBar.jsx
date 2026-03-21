import { useState } from "react";
import "./SearchBar.css";

function SearchBar({
  onSearch,
  colors = [],
  setColors = () => {},
  sortBy = "name",
  setSortBy = () => {},
  extraFilters = { rarity: null, type: null },
  setExtraFilters = () => {},
}) {
  const [value, setValue] = useState("");
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const color_buttons = ["w", "u", "b", "g", "r", "c"];
  const rarities = ["", "common", "uncommon", "rare", "mythic"];

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
    <>
      <div className="card-search">
        <input
          type="text"
          value={value}
          placeholder="Search cards . . ."
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {color_buttons.map((color) => {
          return (
            <button
              onClick={() => setColor(color)}
              key={color}
              className={colors.includes(color) ? "" : "deselected"}
            >
              <i className={`ms ms-${color} ms-cost ms-shadow`}></i>
            </button>
          );
        })}
        <button onClick={() => {}} className={"deselected"}>
          <i className="ms ms-multicolor ms-cost"></i>
        </button>
        <button onClick={() => onSearch(value)} className="search-button">
          <span className="button-top" style={{ background: "lightgreen" }}>
            Search
          </span>
        </button>
      </div>
      <button onClick={() => setPanelCollapsed((prev) => !prev)}>
        {panelCollapsed ? "<" : ">"}
      </button>
      {panelCollapsed && (
        <div className="parameter-tray">
          <div className="sort-select">
            <label for="sort_select">Sort By:</label>
            <select
              name="sort_select"
              id="sort_select"
              onChange={(e) => setSortBy(e.target.value)}
              value={sortBy}
            >
              <option value="name">Name</option>
              <option value="cmc">Cost</option>
              <option value="rarity">Rarity</option>
              <option value="edhrec">EDH Rank</option>
            </select>
          </div>
          <hr />
          <div className="extra-filters-select">
            <span>Extra Filters | </span>
            <label for="rarity_select">Rarity:</label>
            <select
              name="rarity_select"
              id="rarity_select"
              onChange={(e) =>
                setExtraFilters({ ...extraFilters, rarity: e.target.value })
              }
              value={extraFilters.rarity}
            >
              {rarities.map((rarity) => {
                return (
                  <option value={rarity} key={rarity}>
                    {rarity === ""
                      ? "Any Rarity"
                      : `${rarity[0].toUpperCase()}${rarity.slice(1)}`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchBar;
