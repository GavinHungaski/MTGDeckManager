import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import CardSearch from "../components/CardSearch/CardSearch.jsx";
import DeleteCardBtn from "../components/DeleteCardBtn.jsx";
import "./DeckDetail.css";
import ExportDeckButton from "../components/ExportDeckButton.jsx";

function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [groupBy, setGroupBy] = useState("type");
  const [sortBy, setSortBy] = useState("mana");
  const [cards, setCards] = useState([]);
  const [commander, setCommander] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!deckId) return;
    const fetchDeckData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/decks/${deckId}`);
        if (!res.ok) throw new Error("Failed to fetch deck");
        const data = await res.json();
        const formattedCards = data.cards.map(formatCard);
        const formattedCommander = {
          id: data.commander.id,
          name: data.commander.name,
          ...data.commander.card_data,
        };
        setDeck({ id: data.id, name: data.name });
        setCards(formattedCards);
        setCommander(formattedCommander);
        setViewingCard(formattedCommander);
      } catch (err) {
        console.error("Error fetching deck:", err);
      }
    };
    fetchDeckData();
  }, [deckId]);

  const formatCard = (card) => {
    const data = card.card_data;
    return {
      id: card.id,
      scryfall_id: card.scryfall_id,
      name: card.name,
      count: card.count ?? 1,
      is_commander: card.is_commander,

      image: data?.image,
      cmc: data?.cmc,
      prices: data?.prices,
      color_identity: data?.color_identity,
      types: data?.types,
      text: data?.text_box,

      raw: data,
    };
  };

  const totalPrice = useMemo(() => {
    return cards
      .reduce((sum, card) => {
        const price = Number(card.prices?.usd) || 0;
        const count = card.count || 1;
        return sum + price * count;
      }, 0)
      .toFixed(2);
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
          return priceA - priceB || a.name.localeCompare(b.name);
        } else if (sortBy === "type") {
          const typeA = a.types?.type?.[0] || "";
          const typeB = b.types?.type?.[0] || "";
          return typeA.localeCompare(typeB) || a.name.localeCompare(b.name);
        }
        return a.name.localeCompare(b.name);
      });
    });
    return groups;
  }, [cards, groupBy, sortBy, commander]);

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
            scryfall_id: card.scryfall_id,
            card_data: card,
            is_commander: false,
          }),
        },
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const newCard = await res.json();
      const formattedCard = formatCard(newCard);
      setCards((prev) => {
        const existing = prev.find((c) => c.name === formattedCard.name);
        if (existing) {
          return prev.map((c) =>
            c.name === formattedCard.name
              ? { ...c, count: formattedCard.count }
              : c,
          );
        }
        return [...prev, formattedCard];
      });
    } catch (err) {
      console.error("Error adding card:", err);
    }
  }

  function handleRemoveCard(cardToRemove) {
    setCards((prev) => {
      const existing = prev.find((c) => c.name === cardToRemove.name);
      if (!existing) return prev;
      if (existing.count > 1) {
        return prev.map((c) =>
          c.name === cardToRemove.name ? { ...c, count: c.count - 1 } : c,
        );
      }
      return prev.filter((c) => c.name !== cardToRemove.name);
    });
    if (viewingCard?.name === cardToRemove.name) {
      setViewingCard(commander);
    }
  }

  async function handleSetCommander(card) {
    if (commander.id === card.id) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/decks/${deckId}/card/${card.id}/commander`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_commander: true }),
        },
      );
      if (!res.ok) throw new Error("Failed to swap commander");
    } catch (err) {
      console.error("Error swapping commander:", err);
      return;
    }
    setCards((prev) =>
      prev.map((c) =>
        c.id === card.id ? { ...commander, is_commander: false, count: 1 } : c,
      ),
    );
    setCommander({ ...card, is_commander: true });
    if (viewingCard?.id === card.id) {
      setViewingCard({ ...card, is_commander: true });
    }
  }

  return (
    <div className="deck-detail">
      <div className="info-side">
        <h1 className="roboto-font deck-name">
          <b>{deck.name}</b>
        </h1>
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
            <option value="type">Sort by Types</option>
            <option value="price">Sort by Price</option>
          </select>
          <span>
            Count: <b>{cards.reduce((sum, card) => sum + card.count, 0)}</b>
          </span>
          <span>
            Cost: <b>${totalPrice}</b>
          </span>
          <ExportDeckButton cards={cards} />
          <button onClick={() => navigate("playtest")}>
            <span className="button-top">Playtester</span>
          </button>
        </div>

        <div className="card-display">
          <div className="category">
            <span className="roboto-font">
              <b>Commander</b>
            </span>
            <div className="category-cards">
              <div className="card-item">
                <img
                  className="card-item-image"
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
                <b>{category}</b>{" "}
                {groupedCards[category].reduce(
                  (sum, card) => sum + card.count,
                  0,
                )}
              </span>
              <div className="category-cards">
                {groupedCards[category].map((card) => {
                  const canBeCommander =
                    card.types?.super.includes("Legendary") &&
                    (card.types?.type.includes("Creature") ||
                      card.types?.sub.includes("Vehicle") ||
                      card.text?.includes("can be your commander"));
                  const isInvalid = !card.color_identity?.every((color) =>
                    commander?.color_identity?.includes(color),
                  );
                  return (
                    <div
                      className={`card-item ${isInvalid ? "invalid-identity" : ""}`}
                      key={card.id}
                    >
                      <img
                        className="card-item-image"
                        src={card.image}
                        alt={card.name}
                        onMouseEnter={() => setViewingCard(card)}
                      />
                      <span className="card-count">{card.count}</span>
                      <DeleteCardBtn
                        deckId={deck.id}
                        cardId={card.id}
                        card={card}
                        onDelete={handleRemoveCard}
                      />
                      {canBeCommander && (
                        <button
                          onClick={() => {
                            handleSetCommander(card);
                          }}
                          className="set-commander-btn"
                        >
                          C
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeckDetail;
