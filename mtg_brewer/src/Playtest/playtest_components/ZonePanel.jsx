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

  return (
    <div className="zone-container">
      <div
        style={{
          position: "fixed",
          bottom: `${HAND_HEIGHT + 10}px`,
          right: "10px",
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          background: "var(--surface-2)",
          borderRadius: 10,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        {state.graveyard.length === 0 && (
          <span
            style={{
              zIndex: 97,
            }}
          >
            Graveyard
          </span>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: `${HAND_HEIGHT + 10}px`,
          right: exileOut ? `${CARD_WIDTH + 20}px` : 10,
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          background: "var(--red-shadow)",
          borderRadius: 10,
          zIndex: 99,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        {state.exile.length === 0 && (
          <span
            style={{
              zIndex: 97,
            }}
          >
            Exile
          </span>
        )}
        <button
          onClick={() => setExileOut((prev) => !prev)}
          style={{
            position: "absolute",
            left: "-35px",
            top: "45%",
            zIndex: 99,
          }}
        >
          <span className="button-top">{exileOut ? ">" : "<"}</span>
        </button>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: `${HAND_HEIGHT * 2 + 10}px`,
          right: commandOut ? `${CARD_WIDTH + 20}px` : 10,
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          background: "var(--gold-dim)",
          borderRadius: 10,
          zIndex: 99,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        {state.commandZone.length === 0 && (
          <span
            style={{
              zIndex: 97,
            }}
          >
            Command Zone
          </span>
        )}
        <button
          style={{
            position: "absolute",
            left: "-35px",
            top: "45%",
            zIndex: 99,
          }}
          onClick={() => setCommandOut((prev) => !prev)}
        >
          <span className="button-top">{commandOut ? ">" : "<"}</span>
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
                zIndex: 98,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ZonePanel;
