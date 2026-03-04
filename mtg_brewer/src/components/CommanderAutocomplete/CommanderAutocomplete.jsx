import React, { useState, useEffect, useRef } from "react";

function CommanderAutocomplete({ onSelect }) {
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
    if (!search) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);

        const url = `https://api.scryfall.com/cards/search?q=t:legend (t:creature OR t:vehicle) ${search}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Scryfall error");

        const data = await response.json();

        setResults(data.data.slice(0, 10));
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  function handleSelect(card) {
    const image =
      card.image_uris?.small ||
      card.card_faces?.[0]?.image_uris?.small ||
      null;

    const commanderData = {
      name: card.name,
      scryfall_id: card.id,
      image,
      color_identity: card.color_identity,
    };

    onSelect(commanderData);
    setSearch(card.name);
    setShowDropdown(false);
  }

  return (
    <div className="commander-autocomplete" ref={wrapperRef}>
      <input
        type="text"
        value={search}
        placeholder="Search commander..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {showDropdown && (
        <div className="commander-dropdown">
          {loading && <div className="dropdown-item">Loading...</div>}

          {!loading &&
            results.map((card) => {
              const image =
                card.image_uris?.small ||
                card.card_faces?.[0]?.image_uris?.small;

              return (
                <div
                  key={card.id}
                  className="dropdown-item"
                  onClick={() => handleSelect(card)}
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
            })}
        </div>
      )}
    </div>
  );
}

export default CommanderAutocomplete;