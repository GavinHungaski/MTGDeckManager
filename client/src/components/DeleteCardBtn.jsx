import React from "react";
import { cardAPI } from "../services/api";

function DeleteCardBtn({ deckId, cardId, card, onDelete }) {
  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this card?",
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await cardAPI.remove(deckId, cardId);
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
