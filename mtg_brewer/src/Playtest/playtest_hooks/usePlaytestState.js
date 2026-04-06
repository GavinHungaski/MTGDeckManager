import { useReducer } from "react";
import {
  playtestReducer,
  initialState,
} from "../playtest_reducers/playtestReducer.js";

export function usePlaytestState() {
  const [state, dispatch] = useReducer(playtestReducer, initialState);

  const actions = {
    drawCard: () => {
      dispatch({ type: "DRAW_CARD" });
      dispatch({ type: "RESET_REVEAL_DECK" });
    },

    shuffle: () => dispatch({ type: "SHUFFLE_DECK" }),

    playCard: (instanceId, x, y) =>
      dispatch({ type: "PLAY_CARD", payload: { instanceId, x, y } }),

    playSearchedCards: (cards) =>
      dispatch({ type: "PLAY_SEARCHED_CARDS", payload: { cards } }),

    playCommander: (instanceId, x, y) =>
      dispatch({ type: "PLAY_COMMANDER", payload: { instanceId, x, y } }),

    moveCard: (instanceId, x, y) =>
      dispatch({ type: "MOVE_CARD", payload: { instanceId, x, y } }),

    flipCard: (instanceId) =>
      dispatch({ type: "FLIP_CARD", payload: { instanceId } }),

    tapCard: (instanceId) =>
      dispatch({ type: "TAP_CARD", payload: { instanceId } }),

    untapAll: () => dispatch({ type: "UNTAP_ALL" }),

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

    setCount: (playerId, delta, tracker) =>
      dispatch({ type: "SET_COUNT", payload: { playerId, delta, tracker } }),

    nextTurn: () => dispatch({ type: "NEXT_TURN" }),

    toggleTokenCreator: () => dispatch({ type: "TOGGLE_TOKEN_CREATOR" }),

    toggleDeckSearcher: () => dispatch({ type: "TOGGLE_DECK_SEARCHER" }),

    toggleRevealDeck: () => dispatch({ type: "TOGGLE_REVEAL_DECK" }),

    createToken: (token) =>
      dispatch({ type: "CREATE_TOKEN", payload: { token } }),

    addCounter: (instanceId) =>
      dispatch({ type: "ADD_COUNTER", payload: { instanceId } }),

    updateCounter: (instanceId, counterId, updates) =>
      dispatch({
        type: "UPDATE_COUNTER",
        payload: { instanceId, counterId, updates },
      }),

    removeCounter: (instanceId, counterId) =>
      dispatch({
        type: "REMOVE_COUNTER",
        payload: { instanceId, counterId },
      }),

    bringToFront: (instanceId) =>
      dispatch({ type: "BRING_TO_FRONT", payload: { instanceIds } }),

    nextTurn: () => {
      dispatch({ type: "UNTAP_ALL" });
      dispatch({ type: "DRAW_CARD" });
      dispatch({ type: "NEXT_TURN" });
    },
  };

  return { state, dispatch, actions };
}
