import DeleteCardBtn from "../components/DeleteCardBtn.jsx";

export default function CardListView({
  deckId,
  cards,
  commanders,
  groupedCards,
  viewingCard,
  setViewingCard,
  handleIncrementCard,
  handleRemoveCard,
  handleToggleCommander,
  highlightedIds,
}) {
  const commanderColorSet = new Set(
    commanders?.flatMap((c) => c.color_identity || []) || []
  );

  const renderCardRow = (card) => {
    const canBeCommander =
      card.types?.super?.includes("Legendary") &&
      (card.types?.type?.includes("Creature") ||
        card.types?.sub?.includes("Vehicle") ||
        card.text?.includes("can be your commander"));

    const isValid =
      card.color_identity?.every((color) => commanderColorSet.has(color)) ||
      card.color_identity == null;

    return (
      <div
        key={card.id}
        className={`list-card-row ${isValid ? "" : "invalid-identity"} ${highlightedIds?.has(card.id) ? "highlighted" : ""}`}
        onMouseEnter={() => setViewingCard(card)}
      >
        <span className="list-card-count">{card.count}x</span>
        <span className="list-card-name" title={card.name}>
          {card.name}
        </span>
        <div className="list-card-actions">
          <button
            className="list-action-btn increment"
            onClick={() => handleIncrementCard(card)}
            aria-label="Add copy"
          >
            +
          </button>
          <DeleteCardBtn
            deckId={deckId}
            cardId={card.id}
            card={card}
            onDelete={handleRemoveCard}
          />
          {canBeCommander && !card.is_commander && (
            <button
              className="list-action-btn commander"
              onClick={() => handleToggleCommander(card)}
              aria-label="Set commander"
            >
              C
            </button>
          )}
          {card.is_commander && (
            <button
              className="list-action-btn rmv-commander"
              onClick={() => handleToggleCommander(card)}
              aria-label="Remove commander"
            >
              R
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="card-list-view">
      {/* Commander column */}
      {commanders && commanders.length > 0 && (
        <div className="list-category-column">
          <span className="list-category-header">
            <b>Commander</b>{" "}
            {commanders.reduce((s, c) => s + c.count, 0)}
          </span>
          <div className="list-category-rows">
            {commanders.map(renderCardRow)}
          </div>
        </div>
      )}

      {/* Grouped card columns */}
      {Object.keys(groupedCards).map((category) => (
        <div className="list-category-column" key={category}>
          <span className="list-category-header">
            <b>{category}</b>{" "}
            {groupedCards[category].reduce(
              (sum, card) => sum + card.count,
              0
            )}
          </span>
          <div className="list-category-rows">
            {groupedCards[category].map(renderCardRow)}
          </div>
        </div>
      ))}
    </div>
  );
}
