import { useState } from "react";
import "./SearchBar.css";

function SearchBar({
  onSearch,
  colors = [],
  setColors = () => {},
  sortBy = "name",
  setSortBy = () => {},
  extraFilters = { rarities: [], types: [] },
  setExtraFilters = () => {},
}) {
  const [value, setValue] = useState("");
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const color_buttons = ["w", "u", "b", "g", "r", "c"];
  const rarities = ["", "common", "uncommon", "rare", "mythic"];
  const types = [
    "",
    "artifact",
    "creature",
    "planeswalker",
    "enchantment",
    "land",
    "battle",
  ];

  function handleKeyDown(e) {
    if (e.key === "Enter") onSearch(value);
  }

  function setColor(color) {
    setColors((prev) => {
      if (color_buttons.includes(color.toLowerCase())) {
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

  function setRarity(rarity) {
    setExtraFilters((prev) => {
      if (rarities.includes(rarity)) {}
    })
  }
  function setType(type) {}

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
            <label for="sort_select">Sort By: </label>
            <select
              id="sort_select"
              onChange={(e) => setSortBy(e.target.value)}
              value={sortBy}
            >
              <option value="name">ABC</option>
              <option value="cmc">Mana Cost</option>
              <option value="rarity">Rarity</option>
              <option value="edhrec">EDH Rank</option>
            </select>
          </div>
          <hr />
          <div className="extra-filters-select">
            <h3>Extra Filters</h3>
            <span>Rarity: </span>
            {rarities.map((rarity) => {
              return (
                <button
                  onClick={() => setExtraFilters()}
                  key={rarity}
                  className={
                    extraFilters.rarities.includes(rarity) ? "" : "deselected"
                  }
                >
                  <span className="button-top">{rarity}</span>
                </button>
              );
            })}
            <br />
            <span>Types: </span>
            {types.map((type) => {
              return (
                <button
                  onClick={() => setExtraFilters()}
                  key={type}
                  className={
                    extraFilters.rarities.includes(type) ? "" : "deselected"
                  }
                >
                  <span className="button-top">{type}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default SearchBar;
