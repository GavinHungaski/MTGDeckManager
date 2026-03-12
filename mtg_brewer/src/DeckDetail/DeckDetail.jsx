import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router";
import CardSearch from "../components/CardSearch/CardSearch.jsx";
import "./DeckDetail.css";

function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [groupBy, setGroupBy] = useState("type");
  const [sortBy, setSortBy] = useState("mana");
  const [cards, setCards] = useState([]);
  const [commander, setCommander] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0.0);

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
        setViewingCard(data.commander);
      } catch (err) {
        console.error("Error fetching deck:", err);
      }
    };
    fetchDeckData();
  }, [deckId]);

  useEffect(() => {
    let totalPrice = 0.0;
    cards.forEach((card) => {
      totalPrice = totalPrice + Number(card.prices.usd)
    });
    setTotalPrice(totalPrice);
  }, [cards]);

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
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        if (sortBy === "mana") {
          return (a.cmc ?? 0) - (b.cmc ?? 0) || a.name.localeCompare(b.name);
        } else if (sortBy === "price") {
          const priceA = parseFloat(a.prices?.usd) || 0;
          const priceB = parseFloat(b.prices?.usd) || 0;
          return priceB - priceA || a.name.localeCompare(b.name);
        } else if (sortBy === "type") {
          const typeA = a.types?.type?.[0] || "";
          const typeB = b.types?.type?.[0] || "";
          return typeA.localeCompare(typeB) || a.name.localeCompare(b.name);
        }
        return a.name.localeCompare(b.name);
      });
    });
    return groups;
  }, [cards, groupBy, sortBy]);

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
      setCards((prevCards) => [...prevCards, newCard.card_data]);
      console.log(newCard);
    } catch (er) {
      console.error("Error fetching card:", err);
    }
  }

  return (
    <div className="deck-detail">
      <div className="info-side">
        <h1 className="roboto-font deck-name">{deck.name}</h1>
        {viewingCard?.image && (
          <img
            className="viewing-img"
            src={viewingCard.image}
            alt={viewingCard.name}
          />
        )}
        <span className="roboto-font">${viewingCard?.prices?.usd}</span>
      </div>

      <div className="card-view">
        <div className="search-banner roboto-font">
          <CardSearch
            addCard={addCard}
            color_identity={commander?.color_identity || []}
          />
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="type">Group by Types</option>
            <option value="mana">Group By Mana Value</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="mana">Sort by Mana Value</option>
            <option value="types">Sort by Types</option>
          </select>
          <span>Count: {cards.length}</span>
          <span>Cost: ${totalPrice}</span>
        </div>

        <div className="card-display">
          <div className="category">
            <span className="roboto-font">Commander</span>
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
              <span className="roboto-font">
                {category} ({groupedCards[category].length})
              </span>
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
