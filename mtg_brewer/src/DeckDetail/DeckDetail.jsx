import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router";
import CardSearch from "../components/CardSearch/CardSearch.jsx";
import "./DeckDetail.css";

function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [groupBy, setGroupBy] = useState("type");
  const [cards, setCards] = useState([]);

  const CARD_TYPES = [
    "Artifact",
    "Battle",
    "Creature",
    "Enchantment",
    "Instant",
    "Land",
    "Planeswalker",
    "Sorcery",
    "Tribal",
  ];

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

  const groupedCards = useMemo(() => {
    const groups = {};
    cards.forEach((card) => {
      let key = "Other";

      if (groupBy === "type") {
        const types = card.types?.type || [];
        key = types.length === 0 ? "Other" : types[types.length - 1];
      } else if (groupBy === "mana") {
        key = card.cmc ?? 0;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(card);
    });
    return groups;
  }, [cards, groupBy]);

  if (!deck) return <div>Loading...</div>;

  function addCard(card) {
    setCards((prevCards) => [...prevCards, card]);
  }

  return (
    <div className="deck-detail">
      <div className="info-side">
        <h1>{deck.name}</h1>
        {deck.commander?.image && (
          <img
            className="viewing-img"
            src={deck.commander.image}
            alt={deck.commander.name}
          />
        )}
      </div>

      <div className="card-view">
        <div className="search-banner">
          <h2>Cards:</h2>
          <CardSearch
            addCard={addCard}
            color_identity={deck?.commander?.color_identity || []}
          />

          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="type">Group by Type</option>
            <option value="mana">Group by Mana Value</option>
          </select>
        </div>

        <div className="card-display">
          <div className="category">
            <h3>Commander</h3>
            <div className="category-cards">
              <div className="card-item">
                <img
                  className="viewing-img"
                  src={deck.commander.image}
                  alt={deck.commander.name}
                />
              </div>
            </div>
          </div>

          {Object.keys(groupedCards).map((category) => (
            <div className="category" key={category}>
              <h3>
                {category} ({groupedCards[category].length})
              </h3>
              <div className="category-cards">
                {groupedCards[category].map((card, idx) => (
                  <div className="card-item" key={`${card.id}-${idx}`}>
                    <img
                      className="viewing-img"
                      src={card.image}
                      alt={card.name}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeckDetail;
