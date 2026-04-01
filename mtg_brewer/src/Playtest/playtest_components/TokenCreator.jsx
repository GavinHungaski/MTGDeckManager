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
          `"${search}" (t:emblem OR t:token) -is:digital`,
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
    actions.toggleTokenCreator();
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "400px",
        maxWidth: "90%",
        zIndex: 10000,
      }}
    >
      {/* Search bar + X button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--gold-dim)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          padding: "8px",
          position: "relative",
          zIndex: 10001,
        }}
      >
        <input
          type="text"
          value={search}
          placeholder="Search tokens and emblems..."
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => search && setShowDropdown(true)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          onClick={actions.toggleTokenCreator}
          style={{
            marginLeft: "8px",
            background: "transparent",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ✖
        </button>
      </div>

      {/* Dropdown overlay */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#1e1e1e",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            marginTop: "4px",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 10002,
          }}
        >
          {loading && <div style={{ padding: "8px" }}>Loading...</div>}

          {!loading &&
            (results.length > 0 ? (
              results.map((card) => {
                const image =
                  card.image_uris?.small ||
                  card.card_faces?.[0]?.image_uris?.small;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSelect(card)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 8px",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {image && (
                      <img
                        src={image}
                        alt={card.name}
                        style={{
                          width: "32px",
                          height: "45px",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                    <span style={{ color: "#fff" }}>{card.name}</span>
                    {card.power && (
                      <span style={{ marginLeft: "auto", color: "#ccc" }}>
                        {card.power}/{card.toughness}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "8px", color: "#ccc" }}>
                No tokens or emblems found
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default TokenCreator;
