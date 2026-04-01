import { useEffect, createContext } from "react";
import { useParams } from "react-router";
import { expandAndShuffle } from "./playtest_utils/deckUtils";
import { usePlaytestState } from "./playtest_hooks/usePlaytestState.js";
import Battlefield from "./playtest_components/Battlefield.jsx";
import Hand from "./playtest_components/Hand.jsx";
import DeckPile from "./playtest_components/DeckPile.jsx";
import ZonePanel from "./playtest_components/ZonePanel.jsx";
import PlayerHUD from "./playtest_components/PlayerHUD.jsx";
import ContextMenu from "./playtest_components/ContextMenu.jsx";
import TokenCreator from "./playtest_components/TokenCreator.jsx";
import "./Playtest.css";

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
    back_image: data?.back_image,
    cmc: data?.cmc,
    prices: data?.prices,
    color_identity: data?.color_identity,
    types: data?.types,
    text: data?.text_box,
    raw: data,
  };
};

function Playtest() {
  const { deckId } = useParams();
  const { state, dispatch, actions } = usePlaytestState();

  useEffect(() => {
    if (!deckId) return;
    const fetchDeckData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/decks/${deckId}`);
        if (!res.ok) throw new Error("Failed to fetch deck");
        const data = await res.json();
        const formattedCards = data.cards.map(formatCard);

        const { library, deck, commandZone } = expandAndShuffle(formattedCards);

        const players = [
          {
            id: crypto.randomUUID(),
            name: "Player 1",
            life: 40,
            experience: 0,
            poison: 0,
            energy: 0,
            rad: 0,
            commanderDamage: {},
          },
        ];

        dispatch({
          type: "INIT_GAME",
          payload: {
            library,
            deck,
            commandZone,
            players,
            drawStartingHand: 7,
          },
        });
      } catch (err) {
        console.error("Error fetching deck:", err);
      }
    };
    fetchDeckData();
  }, [deckId]);

  return (
    <PlaytestContext.Provider value={{ state, dispatch, actions }}>
      <ContextMenu />
      {state.tokenCreatorOpen && <TokenCreator />}
      <div className="container">
        <PlayerHUD />
        <Battlefield />
        <DeckPile />
        <ZonePanel />
        <Hand />
      </div>
    </PlaytestContext.Provider>
  );
}

export default Playtest;
