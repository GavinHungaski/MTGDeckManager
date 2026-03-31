import React, { useState, useEffect, useRef, useContext } from "react";
import { PlaytestContext } from "../Playtest";
import { getPlayPosition } from "../playtest_utils/deckUtils";

function TokenCreator() {
  const { actions } = useContext(PlaytestContext);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const query = encodeURIComponent(
          `!"${search}" OR ${search} t:token -is:digital`,
        );
        const res = await fetch(
          `https://api.scryfall.com/cards/search?q=${query}`,
        );
        const data = await res.json();

        const sorted = data.data.sort((a, b) => {
          const aExact = a.name.toLowerCase() === search.toLowerCase();
          const bExact = b.name.toLowerCase() === search.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return 0;
        });

        setResults(sorted.slice(0, 10));
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const handleSelect = (card) => {
    const image =
      card.image_uris?.normal ||
      card.card_faces?.[0]?.image_uris?.normal ||
      null;
    const back_image = card.card_faces?.[1]?.image_uris?.normal || null;
    const typeLine = card.type_line || "";
    const [left, right] = typeLine.split("—").map((s) => s.trim());
    const SUPERTYPES = [
      "Basic",
      "Legendary",
      "Snow",
      "World",
      "Ongoing",
      "Elite",
      "Host",
    ];
    const leftWords = left ? left.split(" ") : [];
    const supertypes = leftWords.filter((w) => SUPERTYPES.includes(w));
    const types = leftWords.filter((w) => !SUPERTYPES.includes(w));
    const subtypes = right ? right.split(" ") : [];

    const { x, y } = getPlayPosition();

    const token = {
      instanceId: crypto.randomUUID(),
      name: card.name,
      image,
      back_image,
      types: { super: supertypes, type: types, sub: subtypes },
      cmc: card.cmc,
      color_identity: card.color_identity,
      text: card.oracle_text,
      legalities: card.legalities,
      rarity: card.rarity,
      isToken: true,
      x,
      y,
    };

    actions.createToken(token);

    setSearch("");
    setShowDropdown(false);
    actions.toggleTokenCreator(); // close creator modal
  };

  return (
    <div
      className="card-search"
      ref={wrapperRef}
      style={{
        position: "absolute",
        top: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--gold-dim)",
        padding: "16px",
        borderRadius: "8px",
        zIndex: 999,
        width: "300px",
        minHeight: "300px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <input
        value={search}
        placeholder="Search tokens..."
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search && setShowDropdown(true)}
        style={{ width: "100%", maxHeight: "25px", marginBottom: "8px" }}
      />

      {showDropdown && (
        <div className="dropdown">
          {loading && <div className="dropdown-item">Loading...</div>}

          {!loading && results.length > 0
            ? results.map((card) => {
                const image =
                  card.image_uris?.small ||
                  card.card_faces?.[0]?.image_uris?.small;
                return (
                  <div
                    key={card.id}
                    className="dropdown-item"
                    onClick={() => handleSelect(card)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {image && (
                      <img
                        src={image}
                        alt={card.name}
                        className="dropdown-image"
                      />
                    )}
                    <span>{card.name}</span>
                  </div>
                );
              })
            : !loading &&
              search && <div className="dropdown-item">No tokens found</div>}
        </div>
      )}
    </div>
  );
}

export default TokenCreator;
