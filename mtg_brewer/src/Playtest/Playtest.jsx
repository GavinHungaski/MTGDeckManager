import { useEffect, useReducer, createContext } from "react";
import { useParams } from "react-router";
import { playtestReducer, initialState } from "./playtest_reducers/playtestReducer";
import { expandAndShuffle } from "./playtest_utils/deckUtils";

export const PlaytestContext = createContext();

const formatCard = (card) => {
  const data = card.card_data;
  return {
    id: card.id,
    scryfall_id: card.scryfall_id,
    name: card.name,
    count: card.count ?? 1,
    is_commander: card.is_commander,
    image: data?.image,
    cmc: data?.cmc,
    prices: data?.prices,
    color_identity: data?.color_identity,
    types: data?.types,
    raw: data,
  };
};

function Playtest() {
  const { deckId } = useParams();
  const [state, dispatch] = useReducer(playtestReducer, initialState);

  useEffect(() => {
    if (!deckId) return;
    const fetchDeckData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/decks/${deckId}`);
        if (!res.ok) throw new Error("Failed to fetch deck");
        const data = await res.json();
        const formattedCards = data.cards.map(formatCard);

        const { library, deck } = expandAndShuffle(formattedCards);

        const players = [
          {
            id: crypto.randomUUID(),
            name: "Player 1",
            life: 40,
            commanderDamage: {},
          },
        ];

        dispatch({
          type: "INIT_GAME",
          payload: { library, deck, players },
        });
      } catch (err) {
        console.error("Error fetching deck:", err);
      }
    };
    fetchDeckData();
  }, [deckId]);

  console.log("Game state:", state);

  return (
    <PlaytestContext.Provider value={{ state, dispatch }}>
      <div style={{ width: "100vw", height: "100vh", background: "#2D5A27" }}>
        <p style={{ color: "white" }}>
          Deck loaded — {state.deck.length} cards in library
        </p>
      </div>
    </PlaytestContext.Provider>
  );
}

export default Playtest;
