import React, { useState } from "react";
import { useDeckTray } from "../search_hooks/useDeckTray.js";
import "./DeckTray.css";

function DeckTray({onCardDragEnd}) {
  const { decks, addCardToDeck } = useDeckTray();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`deck-tray-btn ${isOpen ? "open" : ""}`}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <span className="button-top">{isOpen ? ">" : "<"}</span>
      </button>
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
    </>
  );
}

export default DeckTray;
