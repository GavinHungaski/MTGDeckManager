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

  return (
    <div
      style={{
        position: "fixed",
        bottom: `${HAND_HEIGHT * 2 + 10}px`,
        right: "10px",

        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        zIndex: 100,
      }}
    >
      <span
        style={{
          position: "absolute",
          bottom: "0",
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
