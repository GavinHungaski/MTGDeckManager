import { useSearch } from "./search_hooks/useSearch";
import SearchBar from "./search_components/SearchBar";
import phyrexianMana from "../assets/phyrexian_mana.png";
import "./Search.css";

function Search() {
  const {
    cards,
    loading,
    nextPage,
    colors,
    setColors,
    cmcs,
    setCmcs,
    sortBy,
    setSortBy,
    extraFilters,
    setExtraFilters,
    onSearch,
    getRandomCard,
    getMoreCards,
    clearResults,
  } = useSearch();

  return (
    <>
      <div className="search-header">
        <img
          src={phyrexianMana}
          alt="Phyrexian Mana Symbol"
          width="45"
          height="45"
        />
        <h2>Scryfall API</h2>
        <SearchBar
          onSearch={onSearch}
          colors={colors}
          setColors={setColors}
          cmcs={cmcs}
          setCmcs={setCmcs}
          sortBy={sortBy}
          setSortBy={setSortBy}
          extraFilters={extraFilters}
          setExtraFilters={setExtraFilters}
        />
        <button onClick={getRandomCard}>
          <span className="button-top">Random</span>
        </button>
        <button onClick={clearResults}>
          <span className="button-top" style={{ background: "#FF4444" }}>
            Clear
          </span>
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <div className="results-display">
        {cards.map((card) => (
          <div key={card._key}>
            <img
              className="card-img"
              src={
                card.image_uris?.normal ||
                card.image_uris?.small ||
                card.card_faces?.[0]?.image_uris?.normal
              }
              alt={card.name}
            />
          </div>
        ))}
      </div>

      {nextPage && (
        <div style={{ backgroundColor: "gray" }}>
          <button onClick={getMoreCards} className="get-more-button">
            <span className="button-top">Load More</span>
          </button>
        </div>
      )}
    </>
  );
}

export default Search;
