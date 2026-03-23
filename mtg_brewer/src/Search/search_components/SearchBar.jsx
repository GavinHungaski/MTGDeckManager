import { useState } from "react";
import "./SearchBar.css";

function SearchBar({
  onSearch,
  colors = [],
  setColors = () => {},
  cmcs = [],
  setCmcs = () => {},
  sortBy = "name",
  setSortBy = () => {},
  extraFilters = { rarities: [], types: [] },
  setExtraFilters = () => {},
}) {
  const [value, setValue] = useState("");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [colorJoiner, setColorJoiner] = useState(":");
  const [typeJoiner, setTypeJoiner] = useState("OR");

  const color_buttons = ["w", "u", "b", "g", "r", "c"];
  const rarities = ["common", "uncommon", "rare", "mythic"];
  const types = [
    "artifact",
    "creature",
    "enchantment",
    "planeswalker",
    "instant",
    "sorcery",
    "battle",
    "land",
  ];
  const cmc_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  function handleKeyDown(e) {
    if (e.key === "Enter") onSearch(value, colorJoiner, typeJoiner);
  }

  function setColor(color) {
    setColors((prev) => {
      if (color_buttons.includes(color)) {
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

  function setCmc(cmc) {
    setCmcs((prev) => {
      if (cmc_list.includes(cmc)) {
        if (!prev.includes(cmc)) {
          return [...prev, cmc];
        } else {
          return prev.filter((n) => n !== cmc);
        }
      } else {
        return prev;
      }
    });
  }

  function setRarity(rarity) {
    setExtraFilters((prev) => {
      if (rarities.includes(rarity)) {
        if (!prev.rarities.includes(rarity)) {
          return {
            rarities: [...prev.rarities, rarity],
            types: prev.types,
          };
        } else {
          return {
            rarities: prev.rarities.filter((n) => n !== rarity),
            types: prev.types,
          };
        }
      } else {
        return prev;
      }
    });
  }

  function setType(type) {
    setExtraFilters((prev) => {
      if (types.includes(type)) {
        if (!prev.types.includes(type)) {
          return {
            rarities: prev.rarities,
            types: [...prev.types, type],
          };
        } else {
          return {
            rarities: prev.rarities,
            types: prev.types.filter((n) => n !== type),
          };
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
        {"|"}
        <button
          onClick={() => {
            setColorJoiner((prev) => {
              if (prev == ":") return "=";
              else return ":";
            });
          }}
          className={colorJoiner === ":" ? "deselected" : ""}
        >
          <i className="ms ms-multicolor ms-cost"></i>
        </button>
        <button
          className="panel-expand-btn"
          onClick={() => setPanelCollapsed((prev) => !prev)}
        >
          <span className="button-top">{panelCollapsed ? "↑" : "↓"}</span>
        </button>
        <button
          onClick={() => onSearch(value, colorJoiner, typeJoiner)}
          className="search-button"
        >
          <span className="button-top" style={{ background: "lightgreen" }}>
            Search
          </span>
        </button>
      </div>
      {panelCollapsed && (
        <div className="parameter-tray">
          <div className="sort-select">
            <label>Sort By: </label>
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
          <div className="cmc-select">
            <label>Mana Cost: </label>
            {cmc_list.map((cmc) => {
              return (
                <button
                  onClick={() => {
                    setCmc(cmc);
                  }}
                  key={cmc}
                  className={cmcs.includes(cmc) ? "" : "deselected"}
                >
                  <i className={`ms ms-${cmc} ms-cost`}>
                    {cmc >= 12 ? "+" : ""}
                  </i>
                </button>
              );
            })}
          </div>
          <hr />
          <div className="extra-filters-select">
            <span>Rarity: </span>
            {rarities.map((rarity) => {
              return (
                <button
                  onClick={() => setRarity(rarity)}
                  key={rarity}
                  className={
                    extraFilters.rarities.includes(rarity) ? "" : "deselected"
                  }
                >
                  <span className="button-top">{rarity}</span>
                </button>
              );
            })}
            <hr />
            <span>Types: </span>
            {types.map((type) => {
              return (
                <button
                  onClick={() => setType(type)}
                  key={type}
                  className={
                    extraFilters.types.includes(type) ? "" : "deselected"
                  }
                >
                  <span className="button-top">{type}</span>
                </button>
              );
            })}
            {"|"}
            <button
              onClick={() => {
                setTypeJoiner((prev) => {
                  if (prev == "OR") return "AND";
                  else return "OR";
                });
              }}
              className={typeJoiner === "OR" ? "deselected" : ""}
            >
              <span className="button-top">+</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchBar;
