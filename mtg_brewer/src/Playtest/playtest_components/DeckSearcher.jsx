import React, { useState, useEffect, useRef, useContext } from "react";
import { PlaytestContext } from "../Playtest";

function DeckSearcher() {
  const { state, actions } = useContext(PlaytestContext);

  return (
    <div
      style={{
        position: "absolute",
        top: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--gold-dim)",
        padding: "16px",
        borderRadius: "8px",
        zIndex: 999,
        width: "80%",
        minHeight: "300px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Close button */}
      <button
        onClick={() => actions.toggleDeckSearcher()}
        style={{
          position: "absolute",
          bottom: "10px",
          alignSelf: "flex-end",
          background: "transparent",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
          marginBottom: "8px",
        }}
      >
        <span className="button-top">✖</span>
      </button>
    </div>
  );
}

export default DeckSearcher;
