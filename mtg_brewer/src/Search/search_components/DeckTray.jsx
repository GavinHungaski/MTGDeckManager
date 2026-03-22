import React, { useState } from "react";
import "./DeckTray.css";

function DeckTray() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="deck-tray-container">
      <button
        className="deck-tray-btn"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? ">" : "<"}
      </button>
      <div className={`deck-tray ${isOpen ? "open" : ""}`}></div>
    </div>
  );
}

export default DeckTray;
