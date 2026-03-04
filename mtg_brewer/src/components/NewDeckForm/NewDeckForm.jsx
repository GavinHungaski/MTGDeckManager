import React, { useState } from "react";
import CommanderAutocomplete from "../CommanderAutocomplete/CommanderAutocomplete";
import { useNavigate } from "react-router";
import "./NewDeckForm.css";

function NewDeckForm({ showNewDeckForm, closeNewDeckForm, addDeck }) {
  const [deckName, setDeckName] = useState("");
  const [selectedCommander, setSelectedCommander] = useState(null);
  const navigate = useNavigate();

  if (!showNewDeckForm) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deckName) return;

    try {
      const res = await fetch("http://localhost:4000/api/deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: deckName,
          commander: selectedCommander || { name: "TBD" },
        }),
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const newDeck = await res.json();
      addDeck(newDeck);

      setDeckName("");
      setSelectedCommander(null);
      closeNewDeckForm();

      navigate(`/decks/${newDeck.id}`);
    } catch (err) {
      console.error("Error creating deck:", err);
    }
  };

  return (
    <div className="NewDeckForm">
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <br />
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Name of the Deck"
        />

        <br />
        <label>Commander:</label>
        <br />
        <CommanderAutocomplete onSelect={setSelectedCommander} />

        <hr />
        <div className="form-buttons">
          <button type="button" onClick={closeNewDeckForm}>
            <span className="button-top">Cancel</span>
          </button>
          <button type="submit">
            <span className="button-top">Confirm</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewDeckForm;
