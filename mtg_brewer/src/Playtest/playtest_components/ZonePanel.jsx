import { useContext, useState } from "react";
import { PlaytestContext } from "../Playtest";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  HAND_HEIGHT,
} from "../playtest_utils/constants";

function ZonePanel() {
  const { state, actions } = useContext(PlaytestContext);
  const [commandOut, setCommandOut] = useState(false);
  const [exileOut, setExileOut] = useState(false);

  const handleCommandPopout = () => {};

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

          zIndex: 100,
        }}
      ></div>

      {/* Exile */}
      <div
        style={{
          position: "fixed",
          bottom: `${HAND_HEIGHT + 10}px`,
          right: exileOut ? `${CARD_WIDTH + 20}px` : 10,

          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,

          border: "1px solid black",
          borderRadius: 10,

          zIndex: 99,
        }}
      >
        <button
          onClick={() => setExileOut((prev) => !prev)}
          style={{
            position: "absolute",
            left: "-25px",
            top: "50%",
          }}
        >
          <span className="button-top"></span>
        </button>
      </div>

      {/* Command Zone */}
      <div
        style={{
          position: "fixed",
          bottom: `${HAND_HEIGHT * 2 + 10}px`,
          right: commandOut ? `${CARD_WIDTH + 20}px` : 10,

          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,

          border: "1px solid black",
          borderRadius: 10,

          zIndex: 99,
        }}
      >
        <button
          style={{
            position: "absolute",
            left: "-25px",
            top: "50%",
          }}
          onClick={() => setCommandOut((prev) => !prev)}
        >
          <span className="button-top"></span>
        </button>
        {state.commandZone.map((instanceId) => {
          const card = state.cardLibrary[instanceId];
          return (
            <img
              key={card?.instanceId}
              src={card?.image}
              alt="Command Zone"
              onClick={() =>
                actions.playCommander(
                  card?.instanceId,
                  window.innerWidth / 2,
                  200,
                )
              }
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
          );
        })}
      </div>
    </div>
  );
}

export default ZonePanel;
