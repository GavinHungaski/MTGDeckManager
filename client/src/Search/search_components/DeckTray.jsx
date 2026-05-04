import { useState } from "react";
import { useNavigate } from "react-router";
import "./DeckTray.css";

export function DeckTray({ decks, selectedCards, setSelectedCards, addCard, addCardsBatch }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function handleDeckClick(deck) {
    navigate(`/decks/${deck.id}`, { replace: true });
  }

  async function handleAddCards(cards, deck) {
    if (cards.length < 1) {
      alert("No cards selected");
    } else {
      try {
        // Use batch endpoint if available and multiple cards selected
        if (addCardsBatch && cards.length > 1) {
          const result = await addCardsBatch(cards, deck.id);
          if (result.failed > 0) {
            alert(`Added ${result.success} cards to ${deck.name}. ${result.failed} failed.`);
            console.error("Failed cards:", result.errors);
          } else {
            alert(`Successfully added ${result.success} cards to ${deck.name}`);
          }
        } else {
          // Fall back to individual adds for single card or if batch not available
          for (const card of cards) {
            await addCard(card, deck.id);
          }
          alert(`Successfully added ${cards.length} card(s) to ${deck.name}`);
        }
        setSelectedCards([]);
      } catch (error) {
        alert(`Error adding cards: ${error.message}`);
        console.error("Error adding cards:", error);
      }
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
              <div
                style={{
                  display: "grid",
                  justifyItems: "center",
                  marginTop: "10px",
                  marginBottom: "20px",
                }}
                className="commander-stack"
              >
                {deck.commanders.map((c) => {
                  return (
                    <img
                      key={c.id}
                      className="commander-art"
                      src={c?.image_uris?.normal || ""}
                      alt={c?.name || ""}
                      style={{
                        width: "100%",
                        maxWidth: "220px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                        transition: "transform 0.2s ease",
                        gridArea: "1 / 1",
                      }}
                    />
                  );
                })}
              </div>
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
