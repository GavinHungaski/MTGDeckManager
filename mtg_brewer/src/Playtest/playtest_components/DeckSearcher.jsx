import React, { useState, useContext } from "react";
import { PlaytestContext } from "../Playtest";
import {
  CARD_BACK_IMAGE,
  CARD_HEIGHT,
  CARD_WIDTH,
} from "../playtest_utils/constants";

function DeckSearcher() {
  const [search, setSearch] = useState("");
  const [revealedCards, setRevealedCards] = useState(new Set());
  const { state, actions } = useContext(PlaytestContext);

  const deckCards = state.deck
    .map((id) => state.cardLibrary[id])
    .filter(Boolean);

  const filteredCards = deckCards.filter((card) =>
    card.name.toLowerCase().includes(search.toLowerCase()),
  );

  const revealCard = (card) => {
    setRevealedCards((prev) => new Set(prev).add(card.instanceId));
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--gold-dim)",
        padding: "16px",
        borderRadius: "8px",
        zIndex: 999,
        width: "80%",
        minHeight: "300px",
        maxHeight: "600px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Search input */}
      <input
        type="text"
        placeholder="Search deck..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "12px",
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH}px, 1fr))`,
          gap: "12px",
          overflowY: "auto",
          flex: 1,
          paddingBottom: "16px",
        }}
      >
        {filteredCards.map((card, index) => (
          <div
            key={card.instanceId}
            onClick={() => revealCard(card)}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              cursor: "pointer",
            }}
          >
            <img
              src={
                revealedCards.has(card.instanceId)
                  ? card.image
                  : CARD_BACK_IMAGE
              }
              alt={card.name}
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: "12px",
                objectFit: "cover",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            />
            {revealedCards.has(card.instanceId) && (
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                {card.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => actions.toggleDeckSearcher()}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        <span className="button-top">✖</span>
      </button>
    </div>
  );
}

export default DeckSearcher;
