import React, { useState } from "react";
import "./DeckTray.css";

function DeckTray() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`deck-tray ${isOpen ? "open" : ""}`}>
      <button
        className="deck-tray-btn"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <span className="button-top">{isOpen ? ">" : "<"}</span>
      </button>
    </div>
  );
}

export default DeckTray;
