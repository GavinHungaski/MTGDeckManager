import React, { useState } from "react";
import "./DeckTray.css";

export function DeckTray({ decks }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`deck-tray ${isOpen ? "open" : ""}`}>
        {decks.map((deck) => {
          return (
            <div className="deck-item" key={deck.id}>
              <p>{deck.name}</p>
              <img
                className="commander-art"
                src={deck.commander?.image || ""}
                alt={deck.commander?.name || ""}
              />
            </div>
          );
        })}
      </div>
      <button
        className={`deck-tray-btn ${isOpen ? "open" : ""}`}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <span className="button-top">{isOpen ? ">" : "<"}</span>
      </button>
    </>
  );
}
