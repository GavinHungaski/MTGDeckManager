export function expandAndShuffle(cards) {
  const library = {};
  const deck = [];

  for (const card of cards) {
    if (card.is_commander) continue;
    for (let i = 0; i < (card.count ?? 1); i++) {
      const instanceId = crypto.randomUUID();
      library[instanceId] = {
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

  return { library, deck: fisherYates(deck) };
}

export function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
