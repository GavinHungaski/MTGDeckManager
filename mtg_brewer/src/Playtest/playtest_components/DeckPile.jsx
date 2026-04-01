import { useContext } from "react";
import { PlaytestContext } from "../Playtest";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_BACK_IMAGE,
  HAND_HEIGHT,
} from "../playtest_utils/constants";

function DeckPile() {
  const { state, actions } = useContext(PlaytestContext);

  const handleContextMenu = (e) => {
    e.preventDefault();
    actions.setContextMenu(e.clientX, e.clientY, "deck", null);
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        position: "fixed",
        bottom: `${HAND_HEIGHT * 2 + 10}px`,
        right: "10px",
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        borderRadius: 10,
        zIndex: 100,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-4px",
          left: "47%",
        }}
      >
        {state.deck.length}
      </span>
      <img
        src={CARD_BACK_IMAGE}
        alt="Deck"
        onClick={() => actions.drawCard()}
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
    </div>
  );
}

export default DeckPile;
