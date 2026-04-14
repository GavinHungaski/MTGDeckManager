import React, { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

function DeleteCardBtn({ deckId, cardId, card, onDelete }) {
  const { token } = useContext(AuthContext);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this card?",
    );
    if (!isConfirmed) {
      return;
    }
    try {
      const response = await fetch(
        `http://mtg-brewer-backend-env.eba-ajvwwj6w.us-east-2.elasticbeanstalk.com/api/decks/${deckId}/card/${cardId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        const data =
          response.status !== 204
            ? await response.json().catch(() => ({}))
            : {};
        throw new Error(data.error || `Error: ${response.status}`);
      }
      if (onDelete) {
        onDelete(card);
      }
    } catch (err) {
      console.error("Error deleting card:", err.message);
      alert("Failed to delete card. Please try again.");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="card-delete-btn"
      aria-label="Delete card"
    >
      X
    </button>
  );
}

export default DeleteCardBtn;
