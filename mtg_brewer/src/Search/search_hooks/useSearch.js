import { useState, useRef } from "react";

function buildQuery(
  searchText,
  colors,
  sortBy,
  extraFilters,
  color_joiner = ":",
  type_joiner = "OR",
) {
  const parts = [];
  if (searchText.length > 0) {
    parts.push(`!"${searchText}" OR ${searchText}`);
  }
  if (colors.length > 0) {
    parts.push(`id${color_joiner}${colors.join("").toLowerCase()}`);
  }

  const type_string = extraFilters.types
    ?.map((type) => {
      return "t:" + type;
    })
    .join(` ${type_joiner} `);
  if (type_string) parts.push(`(${type_string})`);

  const rarity_string = extraFilters.rarities
    ?.map((rarity) => {
      return "r:" + rarity;
    })
    .join(` OR `);
  if (rarity_string) parts.push(`(${rarity_string})`);

  parts.push("f:commander -is:digital");
  return `https://api.scryfall.com/cards/search?q=${encodeURIComponent(parts.join(" "))}&order=${sortBy}`;
}

export function useSearch() {
  const [cards, setCards] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [colors, setColors] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [extraFilters, setExtraFilters] = useState({ rarities: [], types: [] });
  const [loading, setLoading] = useState(false);

  const keyRef = useRef(0);
  const withKey = (card) => ({ ...card, _key: keyRef.current++ });

  async function runQuery(searchText, color_joiner, type_joiner) {
    try {
      setLoading(true);
      const url = buildQuery(
        searchText,
        colors,
        sortBy,
        extraFilters,
        color_joiner,
        type_joiner,
      );
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setCards(data.data.map(withKey));
      setNextPage(data.next_page || null);
    } catch (error) {
      console.error(error.message);
      setCards([]);
      setNextPage(null);
    } finally {
      setLoading(false);
    }
  }

  function onSearch(text, color_joiner, type_joiner) {
    console.log(extraFilters, color_joiner, type_joiner);
    runQuery(text, color_joiner, type_joiner);
  }

  async function getRandomCard() {
    try {
      setLoading(true);
      const response = await fetch("https://api.scryfall.com/cards/random");
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const result = await response.json();
      setCards((prev) => [...prev, withKey(result)]);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function getMoreCards() {
    if (!nextPage) return;
    try {
      setLoading(true);
      const response = await fetch(nextPage);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const result = await response.json();
      setCards((prev) => [...prev, ...result.data.map(withKey)]);
      setNextPage(result.next_page || null);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function clearResults() {
    setCards([]);
    setNextPage(null);
  }

  return {
    cards,
    loading,
    nextPage,
    colors,
    setColors,
    sortBy,
    setSortBy,
    extraFilters,
    setExtraFilters,
    onSearch,
    getRandomCard,
    getMoreCards,
    clearResults,
  };
}
