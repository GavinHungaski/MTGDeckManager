import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./DeckTray.css";

export function DeckTray({ decks, selectedCards }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function handleDeckClick(deck) {
    navigate(`/decks/${deck.id}`, { replace: true });
  }

  return (
    <>
      <div className={`deck-tray ${isOpen ? "open" : ""}`}>
        {decks.map((deck) => {
          return (
            <div className="deck-item" key={deck.id}>
              <h3>{deck.name}</h3>
              <button className="add-to-btn">
                <span className="button-top">
                  Add {selectedCards.length} to
                </span>
              </button>
              <button
                onClick={() => {
                  handleDeckClick(deck);
                }}
              >
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
