import React, { useState, useContext } from "react";
import { PlaytestContext } from "../Playtest";
import {
  CARD_BACK_IMAGE,
  CARD_HEIGHT,
  CARD_WIDTH,
} from "../playtest_utils/constants";

function DeckSearcher() {
  const [search, setSearch] = useState("");
  const { state, actions } = useContext(PlaytestContext);

  // Map deck IDs to full card objects, preserving order
  const deckCards = state.deck
    .map((id) => state.cardLibrary[id])
    .filter(Boolean); // safety: remove missing cards

  // Filter cards by search string
  const filteredCards = deckCards.filter((card) =>
    card.name.toLowerCase().includes(search.toLowerCase()),
  );

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
        overflowY: "auto",
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

      {/* Card list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredCards.map((card, index) => (
          <div
            key={card.instanceId}
            style={{
              padding: "4px 8px",
              borderBottom: "1px solid rgba(0,0,0,0.2)",
            }}
          >
            <img
              src={CARD_BACK_IMAGE}
              alt={card.name}
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: "12px",
              }}
            />
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
        ✖
      </button>
    </div>
  );
}

export default DeckSearcher;
