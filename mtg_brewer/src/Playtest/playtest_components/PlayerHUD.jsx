import { useContext } from "react";
import { PlaytestContext } from "../Playtest";
import { HUD_HEIGHT } from "../playtest_utils/constants";
import Tracker from "./Tracker.jsx";
import { useNavigate } from "react-router";

function PlayerHUD() {
  const { state, actions } = useContext(PlaytestContext);
  const navigate = useNavigate();

  const activePlayer = state.players.find((p) => p.id === state.activePlayerId);

  if (!activePlayer) return null;

  return (
    <div
      style={{
        width: "100vw",
        height: `${HUD_HEIGHT}px`,
        background: "var(--gold-dim)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <button onClick={() => navigate(-1)}>
        <span className="button-top">Back to Deck</span>
      </button>

      {/* LEFT: Player Info */}
      <div>
        <strong>{activePlayer.name}</strong>
      </div>

      {/* TURN TRACKER */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
          Turn {state.turnNumber}
        </div>

        {/* LIFE TRACKER */}
        <Tracker activePlayer={activePlayer} type="life" />

        {/* POISON TRACKER */}
        <Tracker activePlayer={activePlayer} type="poison" />
      </div>

      {/* RIGHT: ACTIONS */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={actions.nextTurn}>
          <span className="button-top">Next Turn</span>
        </button>

        <button onClick={actions.toggleTokenCreator}>
          <span className="button-top">Create Token / Emblem</span>
        </button>
      </div>
    </div>
  );
}

export default PlayerHUD;
