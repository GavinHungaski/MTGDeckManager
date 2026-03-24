import { useContext } from "react";
import { PlaytestContext } from "../Playtest";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  HAND_HEIGHT,
} from "../playtest_utils/constants";

function ZonePanel() {
  const { state, actions } = useContext(PlaytestContext);

  return (
    <div className="zone-container">
      {/* Graveyard */}
      <div
        style={{
          position: "fixed",
          bottom: `${HAND_HEIGHT + 10}px`,
          right: "10px",

          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,

          border: "1px solid black",
          borderRadius: 10,
        }}
      ></div>

      {/* Exile */}
      <div
        style={{
          position: "fixed",
          bottom: `${HAND_HEIGHT + 10}px`,
          right: `${CARD_WIDTH + 20}px`,

          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,

          border: "1px solid black",
          borderRadius: 10,
        }}
      ></div>

      {/* Command Zone */}
      <div
        style={{
          position: "fixed",
          bottom: `${HAND_HEIGHT * 2 + 10}px`,
          right: `${CARD_WIDTH + 20}px`,

          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,

          border: "1px solid black",
          borderRadius: 10,
        }}
      >
        {state.commandZone.map((commander) => (
          <img
            key={commander?.instanceId}
            src={commander?.image}
            alt="Command Zone"
            onClick={() => {}}
            style={{
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              borderRadius: 10,
              cursor: "pointer",
              flexShrink: 0,
              transition: "transform 0.15s",
              objectFit: "cover",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ZonePanel;
