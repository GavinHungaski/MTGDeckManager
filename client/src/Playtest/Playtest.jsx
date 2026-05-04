import { useEffect, createContext, useContext } from "react";
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
import DeckSearcher from "./playtest_components/DeckSearcher.jsx";
import CardCreator from "./playtest_components/CardCreator.jsx";
import { AuthContext } from "../auth/AuthContext";
import "./Playtest.css";
const API_URL = import.meta.env.VITE_API_URL;
import { v4 as uuidv4 } from "uuid";

export const PlaytestContext = createContext();

const formatCard = (card) => {
  // Extract image URL from image_uris JSONB object
  const imageUrl = card.image_uris?.normal || card.image_uris?.large || null;
  
  return {
    id: card.id,
    scryfall_id: card.id, // Use card id as scryfall_id
    name: card.name,
    count: card.count ?? 1,
    is_commander: card.is_commander,
    image: imageUrl,
    back_image: null, // Back images would need separate handling
    cmc: card.cmc,
    prices: card.prices,
    color_identity: card.color_identity,
    types: card.types,
    text: card.oracle_text,
    mana_cost: card.mana_cost,
    type_line: card.type_line,
    power: card.power,
    toughness: card.toughness,
    raw: card,
  };
};

function Playtest() {
  const { deckId } = useParams();
  const { state, dispatch, actions } = usePlaytestState();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!deckId) return;
    const fetchDeckData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/decks/${deckId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch deck");
        const data = await res.json();
        const formattedCards = data.cards.map(formatCard);
        console.log(formattedCards);
        const { library, deck, commandZone } = expandAndShuffle(formattedCards);

        const players = [
          {
            id: uuidv4(),
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
      {state.deckSearcherOpen && <DeckSearcher />}
      {state.tokenCreatorOpen && <TokenCreator />}
      {state.cardCreatorOpen && <CardCreator />}
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
