import { useContext } from "react";
import { PlaytestContext } from "../Playtest";

function Tracker({ activePlayer, type }) {
  const { _, actions } = useContext(PlaytestContext);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button onClick={() => actions.setCount(activePlayer.id, -3, type)}>
        <span className="button-top">-3</span>
      </button>
      <button onClick={() => actions.setCount(activePlayer.id, -1, type)}>
        <span className="button-top">-1</span>
      </button>
      <div style={{ fontSize: "20px", minWidth: "40px", textAlign: "center" }}>
        {activePlayer[type]}
      </div>
      <button onClick={() => actions.setCount(activePlayer.id, +1, type)}>
        <span className="button-top">+1</span>
      </button>
      <button onClick={() => actions.setCount(activePlayer.id, +3, type)}>
        <span className="button-top">+3</span>
      </button>
    </div>
  );
}

export default Tracker;
