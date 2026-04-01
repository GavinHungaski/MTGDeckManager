import { useContext } from "react";
import { PlaytestContext } from "../Playtest";

function Tracker({ activePlayer, type }) {
  const { actions } = useContext(PlaytestContext);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "8px 12px",
        background: "#1e1e1e",
        borderRadius: "10px",
        width: "fit-content",
      }}
    >
      {/* Decrease buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <button
          onClick={() => actions.setCount(activePlayer.id, -3, type)}
          style={btnSmall}
        >
          <span
            className="button-top"
            style={{ padding: "2px 8px ", color: "black" }}
          >
            -3
          </span>
        </button>
        <button
          onClick={() => actions.setCount(activePlayer.id, -1, type)}
          style={btnSmall}
        >
          <span
            className="button-top"
            style={{ padding: "2px 8px ", color: "black" }}
          >
            -1
          </span>
        </button>
      </div>

      {/* Main value with label */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
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
            fontSize: "28px",
            fontWeight: "bold",
            minWidth: "60px",
            textAlign: "center",
            color: "#fff",
            background: "#2c2c2c",
            padding: "10px 14px",
            borderRadius: "8px",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
          }}
        >
          {activePlayer[type]}
        </div>
      </div>

      {/* Increase buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <button
          onClick={() => actions.setCount(activePlayer.id, +3, type)}
          style={btnSmall}
        >
          <span
            className="button-top"
            style={{ padding: "2px 8px ", color: "black" }}
          >
            +3
          </span>
        </button>
        <button
          onClick={() => actions.setCount(activePlayer.id, +1, type)}
          style={btnSmall}
        >
          <span
            className="button-top"
            style={{ padding: "2px 8px ", color: "black" }}
          >
            +1
          </span>
        </button>
      </div>
    </div>
  );
}

const btnSmall = {
  fontSize: "12px",
  padding: "4px 6px",
  borderRadius: "6px",
  border: "none",
  background: "#444",
  color: "#fff",
  cursor: "pointer",
  transition: "0.15s",
};

export default Tracker;
