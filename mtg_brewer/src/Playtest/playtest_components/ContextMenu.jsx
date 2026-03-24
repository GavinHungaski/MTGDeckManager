import { useEffect, useRef, useContext } from "react";
import { PlaytestContext } from "../Playtest";
import { createPortal } from "react-dom";

function ContextMenu() {
  const { state, actions } = useContext(PlaytestContext);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current || !ref.current.contains(e.target))
        actions.closeContextMenu();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return createPortal(
    state.contextMenu ? (
      <div
        style={{
          position: "fixed",
          top: `${state.contextMenu.y}px`,
          left: `${state.contextMenu.x}px`,

          display: "flex",
          flexDirection: "column",
          z_index: "999",

          background: "var(--gold-dim)",
          borderRadius: 10,
        }}
        ref={ref}
      >
        <button
          onClick={() => {
            actions.tapCard(state.contextMenu.instanceId);
            actions.closeContextMenu();
          }}
        >
          <span className="button-top">Tap / Untap</span>
        </button>
        <button>
          {/* no reducer yet */}
          <span className="button-top">Flip</span>
        </button>
        <hr />
        <button
          onClick={() => {
            actions.sendToZone(state.contextMenu.instanceId, "graveyard");
            actions.closeContextMenu();
          }}
        >
          <span className="button-top">To Graveyard</span>
        </button>
        <button
          onClick={() => {
            actions.sendToZone(state.contextMenu.instanceId, "exile");
            actions.closeContextMenu();
          }}
        >
          <span className="button-top">To Exile</span>
        </button>
        <button
          onClick={() => {
            actions.returnToHand(state.contextMenu.instanceId);
            actions.closeContextMenu();
          }}
        >
          <span className="button-top">To Hand</span>
        </button>
        <button
          onClick={() => {
            actions.returnToDeck(state.contextMenu.instanceId);
            actions.closeContextMenu();
          }}
        >
          <span className="button-top">To Deck</span>
        </button>
      </div>
    ) : null,
    document.body,
  );
}

export default ContextMenu;
