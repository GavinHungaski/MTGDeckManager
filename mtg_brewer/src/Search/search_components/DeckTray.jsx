import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import "./DeckTray.css";

export function DeckTray({ decks }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`deck-tray ${isOpen ? "open" : ""}`}>
        {decks.map((deck) => {
          return <DroppableDeck deck={deck} key={deck.id}></DroppableDeck>;
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

function DroppableDeck({ deck }) {
  const { setNodeRef } = useDroppable({ id: deck.id });
  return (
    <div className="deck-item" key={deck.id} ref={setNodeRef}>
      <p>{deck.name}</p>
      <img
        className="commander-art"
        src={deck.commander?.image || ""}
        alt={deck.commander?.name || ""}
      />
    </div>
  );
}
