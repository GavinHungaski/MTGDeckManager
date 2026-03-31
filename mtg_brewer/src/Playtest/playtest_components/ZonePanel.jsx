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

  const [graveyardIndex, setGraveyardIndex] = useState(0);
  const [exileIndex, setExileIndex] = useState(0);
  const [commandIndex, setCommandIndex] = useState(0);

  const handleZoneScroll = (e, zoneLength, currentIndex, setIndex) => {
    e.preventDefault();
    if (zoneLength === 0) return;

    const delta = e.deltaY > 0 ? 1 : -1;
    const newIndex = currentIndex + delta;

    // Stop at boundaries (no circular scrolling)
    if (newIndex >= 0 && newIndex < zoneLength) {
      setIndex(newIndex);
    }
  };

  // Reset index when zone becomes empty or cards change
  const safeIndex = (index, length) => {
    if (length === 0) return 0;
    return Math.min(index, length - 1);
  };

  return (
    <div className="zone-container">
      {/* Graveyard */}
      <div
        onWheel={(e) =>
          handleZoneScroll(
            e,
            state.graveyard.length,
            graveyardIndex,
            setGraveyardIndex,
          )
        }
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
          <span style={{ zIndex: 97 }}>Graveyard</span>
        )}
        {state.graveyard.length > 0 &&
          (() => {
            const safeIdx = safeIndex(graveyardIndex, state.graveyard.length);
            const instanceId = state.graveyard[safeIdx];
            const card = state.cardLibrary[instanceId];
            return (
              <img
                key={card?.instanceId}
                src={card?.image}
                alt={card?.name}
                onClick={() =>
                  actions.playCard(card?.instanceId, window.innerWidth / 2, 200)
                }
                style={{
                  width: `${CARD_WIDTH}px`,
                  height: `${CARD_HEIGHT}px`,
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  objectFit: "cover",
                  zIndex: 98,
                }}
              />
            );
          })()}
      </div>

      {/* Exile */}
      <div
        onWheel={(e) =>
          handleZoneScroll(e, state.exile.length, exileIndex, setExileIndex)
        }
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
        {state.exile.length === 0 && <span style={{ zIndex: 97 }}>Exile</span>}
        {state.exile.length > 0 &&
          (() => {
            const safeIdx = safeIndex(exileIndex, state.exile.length);
            const instanceId = state.exile[safeIdx];
            const card = state.cardLibrary[instanceId];
            return (
              <img
                key={card?.instanceId}
                src={card?.image}
                alt={card?.name}
                onClick={() =>
                  actions.playCard(card?.instanceId, window.innerWidth / 2, 200)
                }
                style={{
                  width: `${CARD_WIDTH}px`,
                  height: `${CARD_HEIGHT}px`,
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  objectFit: "cover",
                  zIndex: 98,
                }}
              />
            );
          })()}
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

      {/* Command Zone */}
      <div
        onWheel={(e) =>
          handleZoneScroll(
            e,
            state.commandZone.length,
            commandIndex,
            setCommandIndex,
          )
        }
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
          <span style={{ zIndex: 97 }}>Command Zone</span>
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
        {state.commandZone.length > 0 &&
          (() => {
            const safeIdx = safeIndex(commandIndex, state.commandZone.length);
            const instanceId = state.commandZone[safeIdx];
            const card = state.cardLibrary[instanceId];
            return (
              <img
                key={card?.instanceId}
                src={card?.image}
                alt={card?.name}
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
                  transition: "opacity 0.2s",
                  objectFit: "cover",
                  zIndex: 98,
                }}
              />
            );
          })()}
      </div>
    </div>
  );
}

export default ZonePanel;
