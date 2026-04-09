import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import NewDeckForm from "../components/NewDeckForm/NewDeckForm";
import { AuthContext } from "../auth/AuthContext";
import "./Decks.css";

function Decks() {
  const { token } = useContext(AuthContext);
  const [decks, setDecks] = useState([]);
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:4000/api/decks", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setDecks(data))
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
    fetch(`http://localhost:4000/api/decks/${deckId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error(
            `Failed to parse response as JSON (status ${res.status})`,
          );
        }
        if (!res.ok) throw new Error(data?.error || "Failed to delete deck");
        return data;
      })
      .then((data) => {
        console.log(data.message);
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
            <hr />
            <span>{deck.count || 0} cards</span>
            <hr />
            <button onClick={() => handleDeckClick(deck)}>
              <span className="button-top">View</span>
            </button>
            <hr />
            <div
              className="commander-container"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {(deck.commanders || []).map((c, index) => (
                <img
                  key={index}
                  style={{
                    width: "100%",
                    maxWidth: "220px",
                    borderRadius: "10px",
                    alignSelf: "center",
                  }}
                  src={c?.image || ""}
                  alt={c?.name || ""}
                />
              ))}
            </div>
            <hr />
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
