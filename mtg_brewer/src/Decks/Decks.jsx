import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router";
import NewDeckForm from "../components/NewDeckForm/NewDeckForm";
import "./Decks.css";

function Decks() {
  let [decks, setDecks] = useState([]);
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/decks")
      .then((res) => res.json())
      .then((data) => setDecks(data))
      .catch((err) => console.error("Error fetching decks:", err));
  }, []);

  function handleDeckClick(deck) {
    navigate(`${deck.id}`);
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
            <img
              className="deck-img"
              src=""
              alt="Deck IMG"
              onClick={() => handleDeckClick(deck)}
            />
          </div>
        ))}

        <div>
          <button onClick={() => setShowNewDeckForm(true)}>
            <span className="button-top">New Deck</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Decks;
