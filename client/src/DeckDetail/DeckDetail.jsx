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
import { classifyCard } from "./statsUtils";
import "./DeckDetail.css";
import ExportDeckButton from "../components/ExportDeckButton.jsx";
import { AuthContext } from "../auth/AuthContext";
import { deckAPI, cardAPI } from "../services/api";

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
  const [showStats, setShowStats] = useState(true);
  const [highlightFilter, setHighlightFilter] = useState(null);
  const [minimizingPrices, setMinimizingPrices] = useState(false);
  const [minimizeProgress, setMinimizeProgress] = useState({ current: 0, total: 0, phase: "" });
  const [minimizeResult, setMinimizeResult] = useState(null);
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

  // Auto-dismiss minimize result toast after 5 seconds
  useEffect(() => {
    if (!minimizeResult) return;
    const timer = setTimeout(() => setMinimizeResult(null), 5000);
    return () => clearTimeout(timer);
  }, [minimizeResult]);

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

  /* ── Highlight matching cards ─────────────────────────────── */
  const highlightedIds = useMemo(() => {
    if (!highlightFilter) return new Set();
    const ids = new Set();
    for (const card of cards) {
      const cls = classifyCard(card);
      let match = false;
      switch (highlightFilter.type) {
        case "role":
          match = cls.roles.includes(highlightFilter.role);
          break;
        case "cmc": {
          if (card.is_commander) break;
          const typeLine = (card.type_line || "").toLowerCase();
          if (typeLine.includes("land")) break;
          const cmc = Number(card.cmc ?? 0);
          const label = highlightFilter.value;
          if (label === "8+") {
            match = cmc >= 8;
          } else {
            match = cmc === Number(label);
          }
          break;
        }
        case "manaCost":
          match = cls.manaCostColors.includes(highlightFilter.color);
          break;
        case "manaProduced":
          match = cls.manaProducedColors.includes(highlightFilter.color);
          break;
        case "type":
          if (card.is_commander) break;
          match = cls.typeCategory === highlightFilter.category;
          break;
        default:
          break;
      }
      if (match) ids.add(card.id);
    }
    return ids;
  }, [cards, highlightFilter]);

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

  async function fetchScryfallPrices(cardIds) {
    const MAX_BATCH = 75;
    const results = new Map();

    for (let i = 0; i < cardIds.length; i += MAX_BATCH) {
      const batch = cardIds.slice(i, i + MAX_BATCH);
      setMinimizeProgress({ current: i, total: cardIds.length, phase: "fetching" });

      const res = await fetch("https://api.scryfall.com/cards/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiers: batch.map((id) => ({ id })) }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Scryfall batch error (${res.status}): ${errText}`);
      }

      const data = await res.json();

      if (data.data) {
        for (const card of data.data) {
          results.set(card.id, card.prices);
        }
      }

      // Rate limit respect: small delay between batches
      if (i + MAX_BATCH < cardIds.length) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    return results;
  }

  async function fetchFallbackPrice(cardName) {
    const query = encodeURIComponent(`!"${cardName}"`);
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=${query}&unique=prints&order=usd&dir=asc`,
    );

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Scryfall fallback error for "${cardName}" (${res.status}): ${errText}`);
      return null;
    }

    const data = await res.json();
    if (!data.data || data.data.length === 0) return null;

    // Scan all printings and pick the cheapest one with a USD price
    let cheapest = null;
    let cheapestPrice = Infinity;

    for (const card of data.data) {
      const usd = card.prices?.usd != null ? parseFloat(card.prices.usd) : null;
      if (usd != null && usd < cheapestPrice) {
        cheapestPrice = usd;
        cheapest = card.prices;
      }
    }

    // If no non-foil price found, try usd_foil as a last resort
    if (!cheapest) {
      for (const card of data.data) {
        const usdFoil = card.prices?.usd_foil != null ? parseFloat(card.prices.usd_foil) : null;
        if (usdFoil != null && usdFoil < cheapestPrice) {
          cheapestPrice = usdFoil;
          cheapest = card.prices;
        }
      }
    }

    return cheapest;
  }

  function getMinimizedPrices(current, fresh) {
    const keys = ["usd", "usd_foil", "eur", "eur_foil", "tix", "usd_etched"];
    const result = {};
    let changed = false;
    let oldTotal = 0;
    let newTotal = 0;

    for (const key of keys) {
      const currentVal = current?.[key] != null ? parseFloat(current[key]) : null;
      const freshVal = fresh?.[key] != null ? parseFloat(fresh[key]) : null;

      if (currentVal == null && freshVal != null) {
        result[key] = fresh[key];
        changed = true;
        // Don't count first-time price assignments toward savings
      } else if (currentVal != null && freshVal != null && freshVal < currentVal) {
        result[key] = fresh[key];
        changed = true;
        if (key === "usd") {
          oldTotal += currentVal;
          newTotal += freshVal;
        }
      } else {
        result[key] = current?.[key];
        if (key === "usd" && currentVal != null) {
          oldTotal += currentVal;
          newTotal += currentVal;
        }
      }
    }

    return { prices: result, changed, oldTotal, newTotal };
  }

  async function handleMinimizePrices() {
    if (!cards || cards.length === 0) return;
    setMinimizingPrices(true);
    setMinimizeResult(null);

    try {
      const uniqueCards = [...new Map(cards.map((c) => [c.id, c])).values()];
      const cardIds = uniqueCards.map((c) => c.id);

      setMinimizeProgress({ current: 0, total: cardIds.length, phase: "fetching" });
      const freshPrices = await fetchScryfallPrices(cardIds);

      // ── Fallback for cards with no price data on their stored printing ──
      const missingPriceCards = uniqueCards.filter(
        (c) => !freshPrices.get(c.id)?.usd,
      );
      if (missingPriceCards.length > 0) {
        setMinimizeProgress({
          current: 0,
          total: missingPriceCards.length,
          phase: "fetching",
        });
        for (let i = 0; i < missingPriceCards.length; i++) {
          const card = missingPriceCards[i];
          const fallback = await fetchFallbackPrice(card.name);
          if (fallback) {
            freshPrices.set(card.id, fallback);
          }
          setMinimizeProgress({
            current: i + 1,
            total: missingPriceCards.length,
            phase: "fetching",
          });
          // Rate limit respect
          if (i < missingPriceCards.length - 1) {
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      }

      setMinimizeProgress({ current: 0, total: uniqueCards.length, phase: "comparing" });
      const updates = [];

      for (let i = 0; i < uniqueCards.length; i++) {
        const card = uniqueCards[i];
        const fresh = freshPrices.get(card.id);
        if (!fresh) continue;

        const { prices, changed, oldTotal, newTotal } = getMinimizedPrices(card.prices, fresh);

        if (changed) {
          updates.push({
            cardId: card.id,
            prices,
            oldPrice: oldTotal,
            newPrice: newTotal,
          });
        }

        setMinimizeProgress({ current: i + 1, total: uniqueCards.length, phase: "comparing" });
      }

      if (updates.length === 0) {
        setMinimizeResult({ type: "info", message: "All prices are already minimized!" });
        setMinimizingPrices(false);
        return;
      }

      setMinimizeProgress({ current: 0, total: updates.length, phase: "updating" });
      const res = await cardAPI.minimizePrices(deckId, updates);
      const data = res.data;

      setMinimizeResult({
        type: "success",
        message: `Updated ${data.updatedCount} cards · Saved $${data.savings}`,
      });

      await fetchDeckData();
    } catch (err) {
      console.error("Error minimizing prices:", err);
      setMinimizeResult({ type: "error", message: err.message || "Failed to minimize prices." });
    } finally {
      setMinimizingPrices(false);
      setMinimizeProgress({ current: 0, total: 0, phase: "" });
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
          <button
            onClick={handleMinimizePrices}
            disabled={minimizingPrices}
            title="Fetch lowest prices from Scryfall"
          >
            <span className="button-top" style={{ color: "black" }}>
              {minimizingPrices ? "Minimizing..." : "Minimize Prices"}
            </span>
          </button>
        </div>

        {minimizingPrices && (
          <div className="minimize-progress-bar">
            {minimizeProgress.phase === "updating" ? (
              <div className="minimize-updating-row">
                <span className="minimize-spinner" />
                <span className="minimize-progress-label">
                  Updating database...
                </span>
              </div>
            ) : (
              <>
                <div className="minimize-progress-track">
                  <div
                    className="minimize-progress-fill"
                    style={{
                      width: `${minimizeProgress.total > 0 ? (minimizeProgress.current / minimizeProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="minimize-progress-label">
                  {minimizeProgress.phase === "fetching" &&
                    (minimizeProgress.total > 75
                      ? `Fetching prices: ${minimizeProgress.current} / ${minimizeProgress.total}`
                      : `Finding alternate printings: ${minimizeProgress.current} / ${minimizeProgress.total}`)}
                  {minimizeProgress.phase === "comparing" &&
                    `Comparing prices: ${minimizeProgress.current} / ${minimizeProgress.total}`}
                </span>
              </>
            )}
          </div>
        )}

        {minimizeResult && (
          <div className={`minimize-result minimize-result-${minimizeResult.type}`}>
            <button
              className="minimize-result-close"
              onClick={() => setMinimizeResult(null)}
              aria-label="Dismiss"
            >
              ×
            </button>
            {minimizeResult.message}
          </div>
        )}

        {viewMode === "cards" ? (
          <div className="card-display">
            <div className="category">
              <span className="roboto-font">
                <b>Commander</b>
              </span>
              <div className="category-cards">
                {commanders.map((commander) => {
                  return (
                    <div
                      className={`card-item ${highlightedIds.has(commander.id) ? "highlighted" : ""}`}
                      key={commander.id}
                    >
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
                  )}{" "}
                  · $
                  {groupedCards[category]
                    .reduce((sum, card) => {
                      const price = Number(card.prices?.usd) || 0;
                      return sum + price * (card.count || 1);
                    }, 0)
                    .toFixed(2)}
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
                        className={`card-item ${isValid ? "" : "invalid-identity"} ${highlightedIds.has(card.id) ? "highlighted" : ""}`}
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
            highlightedIds={highlightedIds}
          />
        )}
      </div>
      <DeckStats
        cards={cards}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        onHighlight={setHighlightFilter}
      />
    </div>
  );
}

export default DeckDetail;
