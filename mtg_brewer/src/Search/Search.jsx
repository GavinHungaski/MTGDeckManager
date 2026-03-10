import { useState } from "react";
import "./Search.css";

function Search() {
  const [cards, setCards] = useState([]);
  const [nextPage, setNextPage] = useState(null);

  async function getRandomCard() {
    try {
      const response = await fetch("https://api.scryfall.com/cards/random");
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const result = await response.json();
      setCards((prev) => [...prev, result]);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function getList() {
    try {
      const url =
        "https://api.scryfall.com/cards/search?q=t:legend+(t:creature+or+t:vehicle)-is:digital";
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const result = await response.json();
      console.log(result);

      setCards((prev) => [...prev, ...result.data]);
      setNextPage(result.next_page || null);
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
      setCards((prev) => [...prev, ...result.data]);
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
          src="src/assets/phyrexian_mana.png"
          alt="Phyrexian Mana Symbol"
          width="45"
          height="45"
        />
        <h2>Scryfall API</h2>
        <button onClick={getRandomCard}>
          <span className="button-top">Random</span>
        </button>
        <button onClick={getList}>
          <span className="button-top">List</span>
        </button>
        <button onClick={clearResults}>
          <span className="button-top">Clear</span>
        </button>
      </div>

      <div className="results-display">
        {cards.map((card) => (
          <div key={card.id}>
            <img
              className="card-img"
              src={
                card.image_uris?.normal ||
                card.image_uris?.small ||
                card.card_faces[0]?.image_uris?.normal
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
