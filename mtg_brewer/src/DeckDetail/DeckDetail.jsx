import { useEffect, useState } from "react";
import { useParams } from "react-router";
import CardSearch from "../components/CardSearch/CardSearch.jsx";
import "./DeckDetail.css";

function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    console.log("Fetching deckId:", deckId);
    fetch(`http://localhost:4000/api/decks/${deckId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch deck");
        return res.json();
      })
      .then((data) => setDeck(data))
      .catch((err) => console.error("Error fetching deck:", err));
  }, [deckId]);

  if (!deck) return <div>Loading...</div>;

  function addCard(card) {
    console.log("Adding card to deck:", card);
    setCards((prevCards) => [...prevCards, card]);
  }

  return (
    <div className="deck-detail">
      <div className="info-side">
        <h1>{deck.name}</h1>
        {deck.commander?.image && (
          <img src={deck.commander.image} alt={deck.commander.name} />
        )}
      </div>

      <div className="card-view">
        <div className="search-banner">
          <h2>Cards:</h2>
          <CardSearch addCard={addCard} />
        </div>

        <div className="card-dispay">
          {cards.map((card) => {
            return (
              <div className="card-item" key={card.id}>
                <h2>{card.name}</h2>
                <img src={card.image} alt={card.name} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DeckDetail;
