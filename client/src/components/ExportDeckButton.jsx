function ExportDeckButton({ cards }) {
  async function exportDeck() {
    const text = cards.map((card) => `${card.count} ${card.name}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert(`Copied to clipboard:\n\n${text}`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }
  return (
    <button onClick={exportDeck}>
      <span className="button-top" style={{ color: "black" }}>
        Text Export
      </span>
    </button>
  );
}

export default ExportDeckButton;
