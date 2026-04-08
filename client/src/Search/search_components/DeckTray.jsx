import { useState } from "react";
import { useNavigate } from "react-router";
import "./DeckTray.css";

export function DeckTray({ decks, selectedCards, setSelectedCards, addCard }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function handleDeckClick(deck) {
    navigate(`/decks/${deck.id}`, { replace: true });
  }

  async function handleAddCards(cards, deck) {
    if (cards.length < 1) {
      alert("No cards selected");
    } else {
      for (const card of cards) {
        await addCard(card, deck.id);
      }
      alert(`Successfully added ${cards.length} to ${deck.name}`);
      setSelectedCards([]);
    }
  }

  return (
    <>
      <div className={`deck-tray ${isOpen ? "open" : ""}`}>
        {decks?.map((deck) => {
          return (
            <div className="deck-item" key={deck.id}>
              <h3>{deck.name}</h3>
              <button
                className="add-btn"
                onClick={() => {
                  handleAddCards(selectedCards, deck);
                }}
              >
                <span className="button-top">Add {selectedCards.length}</span>
              </button>
              <button
                className="go-btn"
                onClick={() => {
                  handleDeckClick(deck);
                }}
              >
                <span className="button-top">Go to</span>
              </button>
              {deck.commanders.map((c) => {
                return (
                  <img
                    className="commander-art"
                    src={c?.image || ""}
                    alt={c?.name || ""}
                  />
                );
              })}
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
