import { useContext } from "react";
import { PlaytestContext } from "../Playtest";
import {
  HAND_HEIGHT,
  CARD_WIDTH,
  CARD_HEIGHT,
} from "../playtest_utils/constants";

function Hand() {
  const { state, actions } = useContext(PlaytestContext);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        height: `${HAND_HEIGHT}px`,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "8px",
        overflowX: "auto",
        boxSizing: "border-box",
        zIndex: 10,
      }}
    >
      {state.hand.length === 0 && (
        <span style={{ color: "#888", fontSize: 14 }}>Hand is empty</span>
      )}
      {state.hand.map((instanceId) => {
        const card = state.cardLibrary[instanceId];
        return (
          <img
            key={instanceId}
            src={card?.image}
            alt={card?.name}
            title={card?.name}
            style={{
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              borderRadius: 4,
              cursor: "pointer",
              flexShrink: 0,
              transition: "transform 0.15s",
              objectFit: "cover",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-20px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
            onDoubleClick={() => {
              actions.playCard(instanceId, window.innerWidth / 2, 200);
            }}
          />
        );
      })}
    </div>
  );
}

export default Hand;
