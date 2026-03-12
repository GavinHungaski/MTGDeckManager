import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router";
import CardSearch from "../components/CardSearch/CardSearch.jsx";
import "./DeckDetail.css";

function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [groupBy, setGroupBy] = useState("type");
  const [cards, setCards] = useState([]);
  const [commander, setCommander] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);

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
    if (!deckId) return;
    const fetchDeckData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/decks/${deckId}`);
        if (!res.ok) throw new Error("Failed to fetch deck");
        const data = await res.json();
        const flattenedCards = data.cards.map((card) => ({
          ...card.card_data,
          id: card.id,
          is_commander: card.is_commander,
        }));
        setDeck({ id: data.id, name: data.name });
        setCards(flattenedCards);
        setCommander(data.commander);
      } catch (err) {
        console.error("Error fetching deck:", err);
      }
    };
    fetchDeckData();
  }, [deckId]);

  const groupedCards = useMemo(() => {
    if (!cards || !Array.isArray(cards)) return {};
    const groups = {};
    const libraryCards = cards.filter((card) => !card.is_commander);
    libraryCards.forEach((card) => {
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

  async function addCard(card) {
    try {
      const res = await fetch(
        `http://localhost:4000/api/decks/${deckId}/card`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: card.name,
            card_data: card,
            is_commander: false,
          }),
        },
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const newCard = await res.json();
      setCards((prevCards) => [...prevCards, newCard]);
      console.log(newCard);
    } catch (er) {
      console.error("Error fetching card:", err);
    }
  }

  return (
    <div className="deck-detail">
      <div className="info-side">
        <h1>{deck.name}</h1>
        {viewingCard?.image && (
          <img
            className="viewing-img"
            src={viewingCard.image}
            alt={viewingCard.name}
          />
        )}
        <span>${viewingCard?.prices?.usd}</span>
      </div>

      <div className="card-view">
        <div className="search-banner">
          <CardSearch
            addCard={addCard}
            color_identity={commander?.color_identity || []}
          />
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="type">Group by Type</option>
            <option value="mana">Group by Mana Value</option>
          </select>
          <span>Size: {cards.length}</span>
        </div>

        <div className="card-display">
          <div className="category">
            <h3>Commander</h3>
            <div className="category-cards">
              <div className="card-item">
                <img
                  className="viewing-img"
                  src={commander.image}
                  alt={commander.name}
                  onMouseEnter={() => setViewingCard(commander)}
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
                      onMouseEnter={() => setViewingCard(card)}
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
