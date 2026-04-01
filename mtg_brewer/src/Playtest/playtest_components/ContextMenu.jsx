import { useEffect, useRef, useContext } from "react";
import { PlaytestContext } from "../Playtest";
import { createPortal } from "react-dom";

function ContextMenu() {
  const { state, actions } = useContext(PlaytestContext);
  const ref = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        actions.closeContextMenu();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [actions]);

  if (!state.contextMenu) return null;

  const card = state.cardLibrary[state.contextMenu.instanceId];
  const { type } = state.contextMenu;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: `${state.contextMenu.y}px`,
        left: `${state.contextMenu.x}px`,
        display: "flex",
        flexDirection: "column",
        zIndex: 999,
        background: "#2a2a2a",
        border: "1px solid #555",
        borderRadius: "8px",
        padding: "4px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
      }}
    >
      {type === "card" && (
        <>
          <button
            onClick={() => {
              actions.tapCard(state.contextMenu.instanceId);
              actions.closeContextMenu();
            }}
          >
            <span className="button-top">Tap / Untap</span>
          </button>

          <button
            onClick={() => {
              actions.flipCard(state.contextMenu.instanceId);
              actions.closeContextMenu();
            }}
          >
            <span className="button-top">Flip</span>
          </button>

          <hr style={{ width: "100%", border: "0.5px solid #444" }} />

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
              actions.returnToDeckTop(state.contextMenu.instanceId);
              actions.closeContextMenu();
            }}
          >
            <span className="button-top">To Deck (Top)</span>
          </button>

          <button
            onClick={() => {
              actions.returnToDeckBottom(state.contextMenu.instanceId);
              actions.closeContextMenu();
            }}
          >
            <span className="button-top">To Deck (Bottom)</span>
          </button>

          {card?.is_commander && (
            <button
              style={{ borderTop: "1px solid #555", marginTop: "4px" }}
              onClick={() => {
                actions.sendToZone(state.contextMenu.instanceId, "commandZone");
                actions.closeContextMenu();
              }}
            >
              <span className="button-top">To Command Zone</span>
            </button>
          )}
        </>
      )}
      {type === "deck" && (
        <>
          <button
            onClick={() => {
              actions.drawCard();
              actions.closeContextMenu();
            }}
          >
            <span className="button-top">Draw</span>
          </button>
          <button
            onClick={() => {
              actions.shuffle();
              actions.closeContextMenu();
            }}
          >
            <span className="button-top">Shuffle</span>
          </button>
          <button
            onClick={() => {
              actions.toggleDeckSearcher();
              actions.closeContextMenu();
            }}
          >
            <span className="button-top">Look</span>
          </button>
          <button
            onClick={() => {
              actions.toggleRevealDeck();
              actions.closeContextMenu();
            }}
          >
            <span className="button-top">Reveal / Hide</span>
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}

export default ContextMenu;
