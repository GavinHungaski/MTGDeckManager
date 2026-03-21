import { useState, useCallback, useRef } from "react";
import SearchBar from "./search_components/SearchBar";
import phyrexianMana from "../assets/phyrexian_mana.png";
import "./Search.css";

function Search() {
  const [cards, setCards] = useState([]);
  const [nextPage, setNextPage] = useState(null);

  const keyRef = useRef(0);
  const withKey = (card) => ({ ...card, _key: keyRef.current++ });
  const addCard = useCallback((results) => {
    setCards(results.map(withKey));
  }, []);

  async function getRandomCard() {
    try {
      const response = await fetch("https://api.scryfall.com/cards/random");
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const result = await response.json();
      setCards((prev) => [...prev, withKey(result)]);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function getMoreCards() {
    if (!nextPage) return;
    try {
      const response = await fetch(nextPage);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const result = await response.json();
      setCards((prev) => [...prev, ...result.data.map(withKey)]);
      setNextPage(result.next_page || null);
    } catch (error) {
      console.error(error.message);
    }
  }

  function clearResults() {
    setCards([]);
    setNextPage(null);
  }

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
          addResults={addCard}
          colors={[]}
          sortBy={"name"}
          extraFilters={{}}
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

      <div className="results-display">
        {cards.map((card) => (
          <div key={`${card.id}-${Math.random()}`}>
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

      <div style={{ backgroundColor: "gray" }}>
        {nextPage && (
          <button onClick={getMoreCards} className="get-more-button">
            <span className="button-top">Load More</span>
          </button>
        )}
      </div>
    </>
  );
}

export default Search;
