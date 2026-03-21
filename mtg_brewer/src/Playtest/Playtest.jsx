import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";


function Playtest() {
  const { deckId } = useParams();

  useEffect(() => {
    if (!deckId) return;
    const fetchDeckData = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/decks/${deckId}`);
        if (!res.ok) throw new Error("Failed to fetch deck");
        const data = await res.json();
        const formattedCards = data.cards.map(formatCard);
        console.log(data);
        console.log(formattedCards);
      } catch (err) {
        console.error("Error fetching deck:", err);
      }
    };
    fetchDeckData();
  }, [deckId]);

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

  return <div>Hello World</div>;
}

export default Playtest;
