import { HAND_HEIGHT, HUD_HEIGHT } from "./constants";
import { v4 as uuidv4 } from "uuid";

export function getPlayPosition() {
  const width = window.innerWidth;
  const height = window.innerHeight - HAND_HEIGHT - HUD_HEIGHT;

  return {
    x: width / 2,
    y: height / 2,
  };
}

export function expandAndShuffle(cards) {
  const library = {};
  const deck = [];
  const commandZone = [];

  for (const card of cards) {
    if (card.is_commander) {
      const instanceId = uuidv4();
      library[instanceId] = {
        instanceId,
        is_commander: card.is_commander,
        cardId: card.id,
        name: card.name,
        image: card.image,
        back_image: card.back_image,
        colors: card.color_identity,
        types: card.types,
        cmc: card.cmc,
        isToken: false,
      };
      commandZone.push(instanceId);
    } else {
      for (let i = 0; i < (card.count ?? 1); i++) {
        const instanceId = uuidv4();
        library[instanceId] = {
          instanceId,
          is_commander: false,
          cardId: card.id,
          name: card.name,
          image: card.image,
          back_image: card.back_image,
          colors: card.color_identity,
          types: card.types,
          cmc: card.cmc,
          isToken: false,
        };
        deck.push(instanceId);
      }
    }
  }

  return { library, deck: fisherYates(deck), commandZone };
}

export function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
