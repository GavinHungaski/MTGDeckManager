import { useContext } from "react";
import { PlaytestContext } from "../Playtest";
import { HUD_HEIGHT } from "../playtest_utils/constants";

function PlayerHUD() {
  const { state, actions } = useContext(PlaytestContext);

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
      {/* LEFT: Player Info */}
      <div>
        <strong>{activePlayer.name}</strong>
      </div>

      {/* CENTER: TURN + LIFE TRACKER */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => actions.setLife(activePlayer.id, -5)}>
            <span className="button-top">-5</span>
          </button>
          <button onClick={() => actions.setLife(activePlayer.id, -1)}>
            <span className="button-top">-1</span>
          </button>
          <div
            style={{ fontSize: "20px", minWidth: "40px", textAlign: "center" }}
          >
            {activePlayer.life}
          </div>
          <button onClick={() => actions.setLife(activePlayer.id, +1)}>
            <span className="button-top">+1</span>
          </button>
          <button onClick={() => actions.setLife(activePlayer.id, +5)}>
            <span className="button-top">+5</span>
          </button>
        </div>
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
