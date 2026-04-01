import { useContext } from "react";
import { PlaytestContext } from "../Playtest";
import { HUD_HEIGHT } from "../playtest_utils/constants";

function Tracker({ activePlayer, type }) {
  const { actions } = useContext(PlaytestContext);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "4px 6px",
        background: "#1e1e1e",
        borderRadius: "8px",
        width: "fit-content",
        maxHeight: `${HUD_HEIGHT - 20}px`,
      }}
    >
      {/* Decrease buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <button
          onClick={() => actions.setCount(activePlayer.id, -5, type)}
          style={btnSmall}
          disabled={activePlayer[type] < 5}
        >
          -5
        </button>
        <button
          onClick={() => actions.setCount(activePlayer.id, -1, type)}
          style={btnSmall}
          disabled={activePlayer[type] === 0}
        >
          -1
        </button>
      </div>

      {/* Main value with label */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#fff",
            textTransform: "capitalize",
          }}
        >
          {type}
        </div>
        <div
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            minWidth: "50px",
            textAlign: "center",
            color: "#fff",
            background: "#2c2c2c",
            padding: "6px 10px",
            borderRadius: "6px",
            boxShadow: "inset 0 0 4px rgba(0,0,0,0.5)",
          }}
        >
          {activePlayer[type]}
        </div>
      </div>

      {/* Increase buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <button
          onClick={() => actions.setCount(activePlayer.id, +5, type)}
          style={btnSmall}
        >
          +5
        </button>
        <button
          onClick={() => actions.setCount(activePlayer.id, +1, type)}
          style={btnSmall}
        >
          +1
        </button>
      </div>
    </div>
  );
}

const btnSmall = {
  fontSize: "12px",
  padding: "2px 4px",
  borderRadius: "4px",
  height: "25px",
  border: "none",
  background: "#444",
  color: "#fff",
  cursor: "pointer",
  transition: "0.15s",
};

export default Tracker;
