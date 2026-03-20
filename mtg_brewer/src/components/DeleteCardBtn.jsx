import React from "react";

function DeleteCardBtn({ deckId, cardId, card, onDelete }) {
  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this card?",
    );
    if (!isConfirmed) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:4000/api/decks/${deckId}/card/${cardId}`,
        { method: "DELETE" },
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
