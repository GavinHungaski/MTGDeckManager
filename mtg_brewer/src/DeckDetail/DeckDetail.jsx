import { useEffect, useState } from "react";
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

  if (!deck) return <div>Loading...</div>;

  function addCard(card) {
    console.log("Adding card to deck:", card);
    setCards((prevCards) => [...prevCards, card]);
  }

  function groupCards(cards, groupBy) {
    const groups = {};
    cards.forEach((card) => {
      let key;
      if (groupBy == "type") {
        key =
          card.types.type.length == 0
            ? "Other"
            : card.types.type.length == 1
              ? card.types.type[0]
              : card.types.type.at(-1);
      }
      if (groupBy === "mana") {
        key = card.cmc ?? 0;
      }
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(card);
    });
    return groups;
  }

  const groupedCards = groupCards(cards, groupBy);
  const categoryNames = Object.keys(groupedCards);

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
          <CardSearch addCard={addCard} />
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="type">Group by Type</option>
            <option value="mana">Group by Mana Value</option>
          </select>
        </div>

        <div className="card-display">
          {categoryNames.map((category) => {
            return (
              <div className="category" key={category}>
                <h3>{category}</h3>

                <div className="category-cards">
                  {groupedCards[category].map((card) => {
                    return (
                      <div className="card-item" key={card.id}>
                        <img
                          className="viewing-img"
                          src={card.image}
                          alt={card.name}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DeckDetail;
