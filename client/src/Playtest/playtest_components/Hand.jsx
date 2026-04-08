import { useContext, useState } from "react";
import { PlaytestContext } from "../Playtest";
import {
  HAND_HEIGHT,
  CARD_WIDTH,
  CARD_HEIGHT,
} from "../playtest_utils/constants";

function Hand() {
  const { state, actions } = useContext(PlaytestContext);
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    actions.reorderHand(draggedIndex, index);
    setDraggedIndex(null);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100vw",
        height: `${HAND_HEIGHT}px`,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "12px",
        overflowX: "auto",
        boxSizing: "border-box",
        zIndex: 10,
        borderTop: "1px solid #444",
      }}
    >
      {state.hand.length === 0 && (
        <span style={{ color: "#888", fontSize: 14 }}>Hand is empty</span>
      )}

      {state.hand.map((instanceId, index) => {
        const card = state.cardLibrary[instanceId];
        const isBeingDragged = draggedIndex === index;

        return (
          <img
            key={instanceId}
            src={card?.image}
            alt={card?.name}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => setDraggedIndex(null)}
            onDoubleClick={() => {
              actions.playCard(instanceId, window.innerWidth / 2, 300);
            }}
            style={{
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              borderRadius: 10,
              cursor: "grab",
              flexShrink: 0,
              transition: "transform 0.1s, opacity 0.1s",
              objectFit: "cover",
              opacity: isBeingDragged ? 0.4 : 1,
              border: isBeingDragged ? "2px dashed #00bfff" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isBeingDragged)
                e.currentTarget.style.transform =
                  "translateY(-10px) scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
            }}
          />
        );
      })}
    </div>
  );
}

export default Hand;
