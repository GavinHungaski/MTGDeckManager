import {
  useEffect,
  useState,
  useMemo,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router";
import CardSearch from "../components/CardSearch/CardSearch.jsx";
import DeleteCardBtn from "../components/DeleteCardBtn.jsx";
import DeckImportModal from "../components/DeckImportModal/DeckImportModal.jsx";
import DeckStats from "./DeckStats.jsx";
import CardListView from "./CardListView.jsx";
import "./DeckDetail.css";
import ExportDeckButton from "../components/ExportDeckButton.jsx";
import { AuthContext } from "../auth/AuthContext";
import { deckAPI, cardAPI } from "../services/api";

const SUPERTYPES = [
  "Basic",
  "Legendary",
  "Snow",
  "World",
  "Ongoing",
  "Elite",
  "Host",
];

function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);
  const [groupBy, setGroupBy] = useState("type");
  const [sortBy, setSortBy] = useState("mana");
  const [cards, setCards] = useState([]);
  const [commanders, setCommanders] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [showStats, setShowStats] = useState(false);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const hasSetInitialCard = useRef(false);
  const nameInputRef = useRef(null);

  const fetchDeckData = useCallback(async () => {
    if (!deckId) return;
    try {
      const res = await deckAPI.getById(deckId);
      const data = res.data;
      const formattedCards = data.cards.map(formatCard);
      const commanders = formattedCards.filter((c) => c.is_commander);
      setDeck({ id: data.id, name: data.name });
      setCards(formattedCards);
      setCommanders(commanders);
      if (!hasSetInitialCard.current && commanders.length > 0) {
        setViewingCard(commanders[0]);
        hasSetInitialCard.current = true;
      }
    } catch (err) {
      console.error("Error fetching deck:", err);
    }
  }, [deckId]);

  useEffect(() => {
    fetchDeckData();
  }, [fetchDeckData]);

  const formatCard = (card) => {
    return {
      id: card.id,
      name: card.name,
      count: card.count ?? 1,
      is_commander: card.is_commander,

      image: card.front_image,
      back_image: card.back_image || null,
      cmc: card.cmc,
      mana_cost: card.mana_cost,
      prices: card.prices,
      color_identity: card.color_identity,
      types: card.types,
      type_line: card.type_line,
      text: card.oracle_text,
      power: card.power,
      toughness: card.toughness,

      raw: card,
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
  }, [cards, groupBy, sortBy, commanders]);

  if (!deck) return <div>Loading...</div>;

  async function addCard(card) {
    try {
      await cardAPI.add(deckId, {
        id: card.id,
        name: card.name,
        mana_cost: card.mana_cost,
        cmc: card.cmc,
        color_identity: card.color_identity,
        type_line: card.type_line,
        oracle_text: card.oracle_text,
        power: card.power,
        toughness: card.toughness,
        front_image: card.front_image,
        back_image: card.back_image,
        prices: card.prices,
        legalities: card.legalities,
        edhrec_rank: card.edhrec_rank,
        types: card.types,
      });

      await fetchDeckData();
    } catch (err) {
      console.error("Error adding card:", err);
    }
  }

  async function handleIncrementCard(card) {
    try {
      await cardAPI.add(deckId, {
        id: card.id,
        name: card.name,
        mana_cost: card.mana_cost,
        cmc: card.cmc,
        color_identity: card.color_identity,
        type_line: card.type_line,
        oracle_text: card.text,
        power: card.power,
        toughness: card.toughness,
        front_image: card.image,
        back_image: card.back_image,
        prices: card.prices,
        legalities: card.raw?.legalities,
        edhrec_rank: card.raw?.edhrec_rank,
        types: card.types,
      });
      await fetchDeckData();
    } catch (err) {
      console.error("Error incrementing card:", err);
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
      setViewingCard(commanders[0]);
    }
  }

  async function handleToggleCommander(card) {
    const newStatus = !card.is_commander;
    try {
      await cardAPI.toggleCommander(deckId, card.id);
      setCards((prev) =>
        prev.map((c) =>
          c.id === card.id ? { ...c, is_commander: newStatus } : c,
        ),
      );
      setCommanders((prev) => {
        if (newStatus) {
          const exists = prev.find((c) => c.id === card.id);
          return exists ? prev : [...prev, { ...card, is_commander: true }];
        } else {
          return prev.filter((c) => c.id !== card.id);
        }
      });
      if (viewingCard?.id === card.id) {
        setViewingCard({ ...viewingCard, is_commander: newStatus });
      }
    } catch (err) {
      console.error("Error toggling commander:", err);
    }
  }

  function handleStartRename() {
    setEditName(deck.name);
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }

  async function handleSaveName() {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === deck.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await deckAPI.update(deckId, { name: trimmed });
      setDeck((prev) => ({ ...prev, name: trimmed }));
      setIsEditingName(false);
    } catch (err) {
      console.error("Error renaming deck:", err);
      alert("Failed to rename deck. Please try again.");
    }
  }

  function handleCancelRename() {
    setIsEditingName(false);
    setEditName("");
  }

  function handleNameKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  }

  return (
    <div className="deck-detail">
      {showImport && (
        <DeckImportModal
          deckId={deckId}
          onClose={() => setShowImport(false)}
          onSuccess={fetchDeckData}
        />
      )}

      <div className="info-side">
        {isEditingName ? (
          <div className="deck-name-edit">
            <input
              ref={nameInputRef}
              className="deck-name-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleNameKeyDown}
              maxLength={100}
            />
          </div>
        ) : (
          <h1
            className="roboto-font deck-name deck-name-clickable"
            onClick={handleStartRename}
            title="Click to rename"
          >
            <b>{deck.name}</b>
            <span className="rename-hint">✎</span>
          </h1>
        )}
        {viewingCard?.image && (
          <img
            className="viewing-img"
            src={viewingCard.image}
            alt={viewingCard.name}
          />
        )}
        {viewingCard?.back_image && (
          <img
            className="viewing-img"
            src={viewingCard.back_image}
            alt={viewingCard.name + " back"}
          />
        )}
        <span className="roboto-font">${viewingCard?.prices?.usd}</span>
      </div>

      <div className="card-view">
        <div className="search-banner roboto-font">
          <CardSearch
            addCard={addCard}
            color_identity={[
              ...new Set(commanders.flatMap((c) => c.color_identity || [])),
            ]}
          />
          <button onClick={() => setShowImport(true)}>
            <span className="button-top" style={{ color: "black" }}>
              Import List
            </span>
          </button>
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
            <span className="button-top" style={{ color: "black" }}>
              Playtester
            </span>
          </button>
          <button
            onClick={() =>
              setViewMode((m) => (m === "cards" ? "list" : "cards"))
            }
            title={
              viewMode === "cards"
                ? "Switch to list view"
                : "Switch to card view"
            }
          >
            <span className="button-top" style={{ color: "black" }}>
              {viewMode === "cards" ? "List View" : "Card View"}
            </span>
          </button>
          <button
            className="stats-toggle-btn"
            onClick={() => setShowStats((s) => !s)}
            title={showStats ? "Hide stats" : "Show stats"}
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
        </div>

        {viewMode === "cards" ? (
          <div className="card-display">
            <div className="category">
              <span className="roboto-font">
                <b>Commander</b>
              </span>
              <div className="category-cards">
                {commanders.map((commander) => {
                  return (
                    <div className="card-item" key={commander.id}>
                      <img
                        className="card-item-image"
                        src={commander.image}
                        alt={commander.name}
                        onMouseEnter={() => setViewingCard(commander)}
                      />
                      <button
                        onClick={() => handleToggleCommander(commander)}
                        className="rmv-commander-btn"
                      >
                        R
                      </button>
                    </div>
                  );
                })}
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
                      card.types?.super?.includes("Legendary") &&
                      (card.types?.type?.includes("Creature") ||
                        card.types?.sub?.includes("Vehicle") ||
                        card.text?.includes("can be your commander"));
                    const isValid =
                      card.color_identity?.every((color) =>
                        [
                          ...new Set(
                            commanders.flatMap((c) => c.color_identity || []),
                          ),
                        ]?.includes(color),
                      ) || card.color_identity == null;
                    return (
                      <div
                        className={`card-item ${isValid ? "" : "invalid-identity"}`}
                        key={card.id}
                      >
                        <img
                          className="card-item-image"
                          src={card.image}
                          alt={card.name}
                          onMouseEnter={() => setViewingCard(card)}
                        />
                        <span className="card-count">{card.count}</span>
                        <button
                          className="increment-btn"
                          onClick={() => handleIncrementCard(card)}
                          aria-label="Add copy"
                        >
                          +
                        </button>
                        <DeleteCardBtn
                          deckId={deck.id}
                          cardId={card.id}
                          card={card}
                          onDelete={handleRemoveCard}
                        />
                        {canBeCommander && (
                          <button
                            onClick={() => {
                              handleToggleCommander(card);
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
        ) : (
          <CardListView
            deckId={deck.id}
            cards={cards}
            commanders={commanders}
            groupedCards={groupedCards}
            groupBy={groupBy}
            viewingCard={viewingCard}
            setViewingCard={setViewingCard}
            handleIncrementCard={handleIncrementCard}
            handleRemoveCard={handleRemoveCard}
            handleToggleCommander={handleToggleCommander}
          />
        )}
      </div>
      <DeckStats cards={cards} isOpen={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}

export default DeckDetail;
