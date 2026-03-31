import { useReducer } from "react";
import {
  playtestReducer,
  initialState,
} from "../playtest_reducers/playtestReducer.js";

export function usePlaytestState() {
  const [state, dispatch] = useReducer(playtestReducer, initialState);

  const actions = {
    initGame: (library, deck, players) =>
      dispatch({ type: "INIT_GAME", payload: { library, deck, players } }),

    drawCard: () => dispatch({ type: "DRAW_CARD" }),

    shuffle: () => dispatch({ type: "SHUFFLE_DECK" }),

    playCard: (instanceId, x, y) =>
      dispatch({ type: "PLAY_CARD", payload: { instanceId, x, y } }),

    playCommander: (instanceId, x, y) =>
      dispatch({ type: "PLAY_COMMANDER", payload: { instanceId, x, y } }),

    moveCard: (instanceId, x, y) =>
      dispatch({ type: "MOVE_CARD", payload: { instanceId, x, y } }),

    flipCard: (instanceId) =>
      dispatch({ type: "FLIP_CARD", payload: { instanceId } }),

    tapCard: (instanceId) =>
      dispatch({ type: "TAP_CARD", payload: { instanceId } }),

    tapMany: (instanceIds) =>
      dispatch({ type: "TAP_N", payload: { instanceIds } }),

    sendToZone: (instanceId, zone) =>
      dispatch({ type: "SEND_TO_ZONE", payload: { instanceId, zone } }),

    returnToHand: (instanceId) =>
      dispatch({ type: "RETURN_TO_HAND", payload: { instanceId } }),

    returnToDeckTop: (instanceId) =>
      dispatch({ type: "RETURN_TO_DECK_TOP", payload: { instanceId } }),

    returnToDeckBottom: (instanceId) =>
      dispatch({ type: "RETURN_TO_DECK_BOTTOM", payload: { instanceId } }),

    setContextMenu: (x, y, type, instanceId) =>
      dispatch({
        type: "SET_CONTEXT_MENU",
        payload: { x, y, type, instanceId },
      }),

    closeContextMenu: () => dispatch({ type: "CLOSE_CONTEXT_MENU" }),

    selectCards: (instanceIds) =>
      dispatch({ type: "SELECT_CARDS", payload: { instanceIds } }),

    clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),

    setLife: (playerId, delta) =>
      dispatch({ type: "SET_LIFE", payload: { playerId, delta } }),

    nextTurn: () => dispatch({ type: "NEXT_TURN" }),

    toggleTokenCreator: () => dispatch({ type: "TOGGLE_TOKEN_CREATOR" }),

    createToken: (token) =>
      dispatch({ type: "CREATE_TOKEN", payload: { token } }),
  };

  return { state, dispatch, actions };
}
