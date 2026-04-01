import { useContext } from "react";
import { PlaytestContext } from "../Playtest";
import { HUD_HEIGHT } from "../playtest_utils/constants";
import Tracker from "./Tracker.jsx";
import { useNavigate } from "react-router";

function PlayerHUD() {
  const { state, actions } = useContext(PlaytestContext);
  const navigate = useNavigate();
  const currentUrl = document.URL;

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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() =>
            navigate(location.pathname.replace(/\/playtest\/?$/, ""))
          }
        >
          <span className="button-top">Back to Deck</span>
        </button>

        {/* LEFT: Player Info */}
        <strong>{activePlayer.name}</strong>
      </div>

      {/* TRACKERS */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* LIFE TRACKER */}
        <Tracker activePlayer={activePlayer} type="life" />
        {"|"}
        {/* POISON TRACKER */}
        <Tracker activePlayer={activePlayer} type="poison" />

        {/* EXPERIENCE TRACKER */}
        <Tracker activePlayer={activePlayer} type="experience" />

        {/* ENERGY TRACKER */}
        <Tracker activePlayer={activePlayer} type="energy" />

        {/* RAD TRACKER */}
        <Tracker activePlayer={activePlayer} type="rad" />
      </div>

      {/* RIGHT: ACTIONS */}
      <div style={{ display: "flex", gap: "8px" }}>
        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
          Turn {state.turnNumber}
        </div>
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
