import { useState } from "react";
import { cardAPI } from "../../services/api";
import "./DeckImportModal.css";

const SUPERTYPES = [
  "Basic",
  "Legendary",
  "Snow",
  "World",
  "Ongoing",
  "Elite",
  "Host",
];

function parseDecklist(text) {
  const lines = text.split("\n");
  const entries = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("//")) continue;

    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const count = parseInt(match[1], 10);
      const name = match[2].trim();
      if (count > 0 && name) {
        entries.push({ count, name });
      }
    } else {
      entries.push({ count: 1, name: line });
    }
  }
  return entries;
}

function formatCardData(card) {
  const image =
    card.image_uris?.normal ||
    card.card_faces?.[0]?.image_uris?.normal ||
    null;
  const back_image = card.card_faces?.[1]?.image_uris?.normal || null;
  const typeLine = card.type_line || "";
  const [left, right] = typeLine.split("—").map((s) => s.trim());
  const leftWords = left ? left.split(" ") : [];
  const supertypes = leftWords.filter((w) => SUPERTYPES.includes(w));
  const types = leftWords.filter((w) => !SUPERTYPES.includes(w));
  const subtypes = right ? right.split(" ") : [];
  return {
    id: card.id,
    name: card.name,
    color_identity: card.color_identity,
    cmc: card.cmc,
    mana_cost: card.mana_cost,
    type_line: card.type_line,
    oracle_text: card.oracle_text,
    prices: card.prices || null,
    power: card.power,
    toughness: card.toughness,
    front_image: image,
    back_image: back_image,
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
}

async function fetchScryfallBatch(entries) {
  const MAX_BATCH = 75;
  const results = [];
  const notFound = [];

  for (let i = 0; i < entries.length; i += MAX_BATCH) {
    const batch = entries.slice(i, i + MAX_BATCH);
    const identifiers = batch.map((e) => ({ name: e.name }));

    const res = await fetch("https://api.scryfall.com/cards/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifiers }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Scryfall batch error (${res.status}): ${errText}`);
    }

    const data = await res.json();

    if (data.data) {
      for (const card of data.data) {
        const entry = entries.find(
          (e) => e.name.toLowerCase() === card.name.toLowerCase(),
        );
        if (entry) {
          results.push({ card, count: entry.count });
        }
      }
    }

    if (data.not_found) {
      for (const nf of data.not_found) {
        notFound.push(nf.name);
      }
    }
  }

  return { results, notFound };
}

function DeckImportModal({ deckId, onClose, onSuccess }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleImport() {
    const entries = parseDecklist(text);
    if (entries.length === 0) {
      setStatus({ type: "error", message: "No valid entries found." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: `Looking up ${entries.length} cards...` });

    let lookupResults;
    let notFoundNames;
    try {
      const batchResult = await fetchScryfallBatch(entries);
      lookupResults = batchResult.results;
      notFoundNames = batchResult.notFound;
    } catch (err) {
      console.error("Scryfall batch lookup error:", err);
      setStatus({ type: "error", message: err.message });
      setLoading(false);
      return;
    }

    if (lookupResults.length === 0) {
      setStatus({
        type: "error",
        message: `Could not find any of the ${entries.length} cards on Scryfall.`,
      });
      setLoading(false);
      return;
    }

    const cardsData = [];
    for (const { card, count } of lookupResults) {
      const formatted = formatCardData(card);
      for (let i = 0; i < count; i++) {
        cardsData.push(formatted);
      }
    }

    setStatus({ type: "info", message: `Adding ${cardsData.length} cards...` });

    try {
      const res = await cardAPI.addBatch(deckId, cardsData);
      const data = res.data;

      let msg = "";
      if (notFoundNames.length > 0) {
        msg += `Not found: ${notFoundNames.join(", ")}. `;
      }
      if (data.failed > 0) {
        msg += `Added ${data.success}, failed ${data.failed}.`;
        if (data.errors?.length) {
          msg += ` Errors: ${data.errors.map((e) => e.card).join(", ")}`;
        }
      } else {
        msg += `Successfully added ${data.success} cards!`;
      }

      setStatus({ type: "success", message: msg });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Batch add error:", err);
      setStatus({ type: "error", message: "Server error during import." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="import-modal-overlay" onClick={onClose}>
      <div className="import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="import-modal-header">
          <h2>Import Decklist</h2>
          <button className="import-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="import-modal-body">
          <label htmlFor="decklist-text">
            Paste your decklist below (one card per line):
          </label>
          <textarea
            id="decklist-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`1 Sol Ring\n2 Forest\n1 Urza's Mine\n// comments are ignored`}
            disabled={loading}
          />
          <span className="hint">
            Format: <code>{`<count> <card name>`}</code> or just{" "}
            <code>{`<card name>`}</code> for single copies.
          </span>
        </div>
        <div className="import-modal-footer">
          <span className={`status ${status?.type || ""}`}>
            {status?.message || ""}
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="import-btn"
              onClick={handleImport}
              disabled={loading || !text.trim()}
            >
              {loading ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeckImportModal;
