export const initialState = {
  deck: [],
  hand: [],
  graveyard: [],
  exile: [],
  battlefield: [],
  stacks: [],
  cardLibrary: {},
  players: [],
  activePlayerId: null,
  selectedInstanceIds: [],
  contextMenu: null,
  viewingZone: null,
  tokenCreatorOpen: false,
};

export function playtestReducer(state, action) {
  switch (action.type) {
    case "INIT_GAME": {
      const { library, deck, players } = action.payload;
      return {
        ...initialState,
        cardLibrary: library,
        deck,
        players,
        activePlayerId: players[0].id,
      };
    }

    default:
      return state;
  }
}
