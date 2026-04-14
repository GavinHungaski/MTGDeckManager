import React, { useState } from "react";
import CommanderAutocomplete from "../CommanderAutocomplete/CommanderAutocomplete";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import { API_URL } from "../../constants.js";
import "./NewDeckForm.css";

function NewDeckForm({ showNewDeckForm, closeNewDeckForm, addDeck }) {
  const [deckName, setDeckName] = useState("");
  const [selectedCommander, setSelectedCommander] = useState(null);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  if (!showNewDeckForm) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deckName) return;

    try {
      const res = await fetch(`${API_URL}/api/deck`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
