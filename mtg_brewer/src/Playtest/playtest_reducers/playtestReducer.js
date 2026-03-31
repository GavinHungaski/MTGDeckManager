import { fisherYates } from "../playtest_utils/deckUtils.js";

export const initialState = {
  deck: [],
  hand: [],
  graveyard: [],
  exile: [],
  commandZone: [],
  battlefield: [],
  stacks: [],
  cardLibrary: {},
  players: [],
  activePlayerId: null,
  selectedInstanceIds: [],
  contextMenu: null,
  viewingZone: null,
  tokenCreatorOpen: false,
  turnNumber: 0,
};

export function playtestReducer(state, action) {
  switch (action.type) {
    case "INIT_GAME": {
      const {
        library,
        deck,
        commandZone = [],
        players,
        drawStartingHand = 7,
      } = action.payload;
      const startingHand = deck.slice(0, drawStartingHand);
      const restOfDeck = deck.slice(drawStartingHand);
      return {
        ...initialState,
        cardLibrary: library,
        deck: restOfDeck,
        hand: startingHand,
        commandZone,
        players,
        activePlayerId: players[0].id,
      };
    }

    case "DRAW_CARD": {
      if (state.deck.length === 0) return state;
      const [top, ...rest] = state.deck;
      return { ...state, deck: rest, hand: [...state.hand, top] };
    }

    case "DRAW_N": {
      const n = Math.min(action.payload.n, state.deck.length);
      const drawn = state.deck.slice(0, n);
      const rest = state.deck.slice(n);
      return { ...state, deck: rest, hand: [...state.hand, ...drawn] };
    }

    case "SHUFFLE_DECK": {
      const shuffled = fisherYates(state.deck);
      return { ...state, deck: shuffled };
    }

    case "PLAY_CARD": {
      const { instanceId, x, y } = action.payload;
      return {
        ...state,
        hand: state.hand.filter((id) => id !== instanceId),
        graveyard: state.graveyard.filter((id) => id !== instanceId),
        exile: state.exile.filter((id) => id !== instanceId),
        battlefield: [
          ...state.battlefield,
          {
            instanceId,
            x,
            y,
            tapped: false,
            facedown: false,
            isToken: false,
            counters: [],
            stackId: null,
          },
        ],
      };
    }

    case "PLAY_COMMANDER": {
      const { instanceId, x, y } = action.payload;
      return {
        ...state,
        commandZone: state.commandZone.filter((id) => id !== instanceId),
        battlefield: [
          ...state.battlefield,
          {
            instanceId,
            x,
            y,
            tapped: false,
            facedown: false,
            isToken: false,
            counters: [],
            stackId: null,
          },
        ],
      };
    }

    case "MOVE_CARD": {
      const { instanceId, x, y } = action.payload;
      return {
        ...state,
        battlefield: state.battlefield.map((c) =>
          c.instanceId === instanceId ? { ...c, x, y } : c,
        ),
      };
    }

    case "FLIP_CARD": {
      return {
        ...state,
        battlefield: state.battlefield.map((c) =>
          c.instanceId === action.payload.instanceId
            ? { ...c, flipped: !c.flipped }
            : c,
        ),
      };
    }

    case "TAP_CARD": {
      return {
        ...state,
        battlefield: state.battlefield.map((c) =>
          c.instanceId === action.payload.instanceId
            ? { ...c, tapped: !c.tapped }
            : c,
        ),
      };
    }

    case "UNTAP_ALL": {
      return {
        ...state,
        battlefield: state.battlefield.map((c) => ({ ...c, tapped: false })),
      };
    }

    case "TAP_N": {
      return {
        ...state,
        battlefield: state.battlefield.map((c) =>
          action.payload.instanceIds.includes(c.instanceId)
            ? { ...c, tapped: true }
            : c,
        ),
      };
    }

    case "SEND_TO_ZONE": {
      const { instanceId, zone } = action.payload;
      const card = state.cardLibrary[instanceId];
      if (card?.isToken) {
        return {
          ...state,
          battlefield: state.battlefield.filter(
            (c) => c.instanceId !== instanceId,
          ),
        };
      }
      return {
        ...state,
        battlefield: state.battlefield.filter(
          (c) => c.instanceId !== instanceId,
        ),
        [zone]: [instanceId, ...state[zone]],
      };
    }

    case "RETURN_TO_HAND": {
      const { instanceId } = action.payload;
      const card = state.cardLibrary[instanceId];
      return {
        ...state,
        battlefield: state.battlefield.filter(
          (c) => c.instanceId !== instanceId,
        ),
        hand: card?.isToken ? state.hand : [...state.hand, instanceId],
      };
    }

    case "RETURN_TO_DECK_TOP": {
      const { instanceId } = action.payload;
      const card = state.cardLibrary[instanceId];
      return {
        ...state,
        battlefield: state.battlefield.filter(
          (c) => c.instanceId !== instanceId,
        ),
        deck: card?.isToken ? state.deck : [instanceId, ...state.deck],
      };
    }

    case "RETURN_TO_DECK_BOTTOM": {
      const { instanceId } = action.payload;
      const card = state.cardLibrary[instanceId];
      return {
        ...state,
        battlefield: state.battlefield.filter(
          (c) => c.instanceId !== instanceId,
        ),
        deck: card?.isToken ? state.deck : [...state.deck, instanceId],
      };
    }

    case "SET_CONTEXT_MENU": {
      const { x, y, type, instanceId } = action.payload;
      return { ...state, contextMenu: { x, y, type, instanceId } };
    }

    case "CLOSE_CONTEXT_MENU": {
      return { ...state, contextMenu: null };
    }

    case "SELECT_CARDS": {
      return {
        ...state,
        selectedInstanceIds: action.payload.instanceIds,
      };
    }

    case "ADD_TO_SELECTION": {
      const incoming = action.payload.instanceIds;
      const merged = [...new Set([...state.selectedInstanceIds, ...incoming])];
      return { ...state, selectedInstanceIds: merged };
    }

    case "CLEAR_SELECTION": {
      return { ...state, selectedInstanceIds: [] };
    }

    case "SET_LIFE": {
      const { playerId, delta } = action.payload;
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, life: p.life + delta } : p,
        ),
      };
    }

    case "NEXT_TURN": {
      const idx = state.players.findIndex((p) => p.id === state.activePlayerId);
      const next = state.players[(idx + 1) % state.players.length];

      return {
        ...state,
        activePlayerId: next.id,
        turnNumber: state.turnNumber + 1,
      };
    }

    case "TOGGLE_TOKEN_CREATOR": {
      return {
        ...state,
        tokenCreatorOpen: !state.tokenCreatorOpen,
      };
    }

    case "CREATE_TOKEN": {
      const { token } = action.payload;

      return {
        ...state,
        cardLibrary: {
          ...state.cardLibrary,
          [token.instanceId]: token,
        },
        battlefield: [
          ...state.battlefield,
          {
            instanceId: token.instanceId,
            x: token.x,
            y: token.y,
            tapped: false,
            facedown: false,
            isToken: true,
            counters: [],
            stackId: null,
          },
        ],
      };
    }

    default:
      return state;
  }
}
