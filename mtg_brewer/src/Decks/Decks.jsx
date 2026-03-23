import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import NewDeckForm from "../components/NewDeckForm/NewDeckForm";
import "./Decks.css";

function Decks() {
  let [decks, setDecks] = useState([]);
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/decks")
      .then((res) => res.json())
      .then((data) => {
        setDecks(data);
      })
      .catch((err) => console.error("Error fetching decks:", err));
  }, []);

  function handleDeckClick(deck) {
    navigate(`${deck.id}`);
  }

  function deleteDeck(deckId) {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this deck?",
    );
    if (!isConfirmed) {
      return;
    }
    fetch(`http://localhost:4000/api/decks/${deckId}`, {
      method: "DELETE",
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

        if (!res.ok) {
          throw new Error(data?.error || "Failed to delete deck");
        }

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
            <span>id: {deck.id}</span>
            <hr />
            <span>{Date(deck.created_at)}</span>
            <hr />
            <button onClick={() => handleDeckClick(deck)}>
              <span className="button-top">View</span>
            </button>
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
