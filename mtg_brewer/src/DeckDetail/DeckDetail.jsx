import { useEffect, useState } from "react";
import { useParams } from "react-router";
import "./DeckDetail.css";

function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState(null);

  useEffect(() => {
    console.log("Fetching deckId:", deckId);
    fetch(`http://localhost:4000/api/decks/${deckId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch deck");
        return res.json();
      })
      .then((data) => setDeck(data))
      .catch((err) => console.error("Error fetching deck:", err));
  }, [deckId]);

  if (!deck) return <div>Loading...</div>;

  return (
    <div className="deck-detail">
      
      <h1>{deck.name}</h1>

      {deck.commander?.image && (
        <img
          src={deck.commander.image}
          alt={deck.commander.name}
        />
      )}

      <p>Commander: {deck.commander?.name || "None"}</p>

    </div>
  );
}

export default DeckDetail;