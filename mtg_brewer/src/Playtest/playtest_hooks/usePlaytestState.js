import { useReducer } from "react";
import { playtestReducer, initialState } from "../playtest_reducers/playtestReducer.js";

export function usePlaytestState() {
  const [state, dispatch] = useReducer(playtestReducer, initialState);

  const actions = {
    initGame: (library, deck, players) =>
      dispatch({ type: "INIT_GAME", payload: { library, deck, players } }),

    drawCard: () => dispatch({ type: "DRAW_CARD" }),

    playCard: (instanceId, x, y) =>
      dispatch({ type: "PLAY_CARD", payload: { instanceId, x, y } }),

    moveCard: (instanceId, x, y) =>
      dispatch({ type: "MOVE_CARD", payload: { instanceId, x, y } }),

    tapCard: (instanceId) =>
      dispatch({ type: "TAP_CARD", payload: { instanceId } }),

    sendToZone: (instanceId, zone) =>
      dispatch({ type: "SEND_TO_ZONE", payload: { instanceId, zone } }),

    returnToHand: (instanceId) =>
      dispatch({ type: "RETURN_TO_HAND", payload: { instanceId } }),

    setContextMenu: (x, y, instanceId) =>
      dispatch({ type: "SET_CONTEXT_MENU", payload: { x, y, instanceId } }),

    closeContextMenu: () => dispatch({ type: "CLOSE_CONTEXT_MENU" }),

    selectCards: (instanceIds) =>
      dispatch({ type: "SELECT_CARDS", payload: { instanceIds } }),

    clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),
  };

  return { state, dispatch, actions };
}
