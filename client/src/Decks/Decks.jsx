import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import NewDeckForm from "../components/NewDeckForm/NewDeckForm";
import { AuthContext } from "../auth/AuthContext";
import { deckAPI } from "../services/api";
import "./Decks.css";

function Decks() {
  const { token } = useContext(AuthContext);
  const [decks, setDecks] = useState([]);
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    deckAPI.getAll()
      .then((res) => setDecks(res.data))
      .catch((err) => console.error("Error fetching decks:", err));
  }, [token]);

  function handleDeckClick(deck) {
    navigate(`${deck.id}`);
  }

  function deleteDeck(deckId) {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this deck?",
    );
    if (!isConfirmed) return;
    deckAPI.delete(deckId)
      .then((res) => {
        console.log(res.data.message);
        setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
      })
      .catch((err) => console.error("Error deleting deck:", err));
  }

  return (
    <>
      <NewDeckForm
        showNewDeckForm={showNewDeckForm}
        closeNewDeckForm={() => setShowNewDeckForm(false)}
        addDeck={(deck) => setDecks((prev) => [...prev, deck])}
      />

      <div className="deck-display">
        {decks.map((deck) => (
          <div className="deck-item" key={deck.id}>
            <h2>{deck.name}</h2>
            <span>{deck.count || 0} cards</span>
            <hr />
            <button onClick={() => handleDeckClick(deck)}>
              <span className="button-top">View</span>
            </button>
            <div
              className="commander-container"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{
                  display: "grid",
                  justifyItems: "center",
                  marginTop: "10px",
                  marginBottom: "20px",
                }}
                className="commander-stack"
              >
                {(deck.commanders || []).map((c, index) => (
                  <img
                    key={index}
                    style={{
                      width: "100%",
                      maxWidth: "220px",
                      borderRadius: "10px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                      transition: "transform 0.2s ease",
                      gridArea: "1 / 1",
                    }}
                    className="commander-card"
                    src={c?.front_image || ""}
                    alt={c?.name || ""}
                  />
                ))}
              </div>
            </div>
            <button onClick={() => deleteDeck(deck.id)}>
              <span className="button-top difBg">Delete</span>
            </button>
          </div>
        ))}

        <div className="new-deck-button">
          <button onClick={() => setShowNewDeckForm(true)}>
            <span className="button-top">New Deck</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Decks;
