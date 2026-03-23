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
              <h3>{deck.name}</h3>
              <button className="add-to-btn">
                <span className="button-top">Add to</span>
              </button>
              <button>
                <span className="button-top">Go to</span>
              </button>
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
