import { useState, useEffect } from "react";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import { API_URL } from "../../constants.js";

const SUPERTYPES = [
  "Basic",
  "Legendary",
  "Snow",
  "World",
  "Ongoing",
  "Elite",
  "Host",
];

function processCard(card) {
  const image =
    card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || null;
  const back_image = card.card_faces?.[1].image_uris?.normal || null;
  const typeLine = card.type_line || "";
  const [left, right] = typeLine.split("—").map((s) => s.trim());
  const leftWords = left ? left.split(" ") : [];
  const supertypes = leftWords.filter((w) => SUPERTYPES.includes(w));
  const types = leftWords.filter((w) => !SUPERTYPES.includes(w));
  const subtypes = right ? right.split(" ") : [];
  const cardData = {
    name: card.name,
    image,
    back_image,
    scryfall_id: card.id,
    color_identity: card.color_identity,
    cmc: card.cmc,
    mana_cost: card.mana_cost,
    prices: card.prices || null,
    power: card.power,
    toughness: card.toughness,
    types: {
      super: supertypes,
      type: types,
      sub: subtypes,
    },
    text_box: card.oracle_text,
    legalities: card.legalities,
    keywords: card.keywords,
    rarity: card.rarity,
    meta_rank: card.edhrec_rank,
  };
  return cardData;
}

export function useDeckTray() {
  const { token } = useContext(AuthContext);
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    if (!token) {
      setDecks([]);
      return;
    }
    fetch(`${API_URL}/api/decks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Decks fetch returned invalid data:", data);
          setDecks([]);
        } else {
          setDecks(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching decks:", err);
        setDecks([]);
      });
  }, [token]);

  async function addCardToDeck(card, deckId) {
    const newCard = processCard(card);
    try {
      const res = await fetch(`${API_URL}/api/decks/${deckId}/card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCard.name,
          scryfall_id: newCard.scryfall_id,
          card_data: newCard,
          is_commander: false,
        }),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      return (result = await res.json());
    } catch (err) {
      console.error("Error adding card:", err);
    }
  }

  return {
    decks,
    addCardToDeck,
  };
}
