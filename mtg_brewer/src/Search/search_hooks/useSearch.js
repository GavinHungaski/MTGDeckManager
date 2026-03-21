import { useState, useEffect, useRef } from "react";

function buildQuery(searchText, colors, sortBy, extraFilters) {
  const parts = [];

  if (searchText.length >= 2) {
    parts.push(`!"${searchText}" OR ${searchText}`);
  }

  if (colors.length > 0) {
    parts.push(`id:${colors.join("").toLowerCase()}`);
  }

  // extraFilters scaffold — expand later
  if (extraFilters.type) parts.push(`t:${extraFilters.type}`);

  parts.push("f:commander -is:digital");

  return `https://api.scryfall.com/cards/search?q=${encodeURIComponent(parts.join(" "))}&order=${sortBy}`;
}

export function useSearch() {
  const [cards, setCards] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [committedSearch, setCommittedSearch] = useState("");
  const [colors, setColors] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [extraFilters, setExtraFilters] = useState({});
  const [loading, setLoading] = useState(false);

  const keyRef = useRef(0);
  const withKey = (card) => ({ ...card, _key: keyRef.current++ });

  // re-fire when filters change, only if a search is committed
  useEffect(() => {
    if (committedSearch.length < 2) return;
    runQuery(committedSearch);
  }, [colors, sortBy, extraFilters]);

  async function runQuery(searchText) {
    try {
      setLoading(true);
      const url = buildQuery(searchText, colors, sortBy, extraFilters);
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

  function onSearch(text) {
    setCommittedSearch(text);
    runQuery(text);
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
    setCommittedSearch("");
  }

  return {
    cards,
    loading,
    nextPage,
    colors,
    setColors, // scaffold — wire to color toggles later
    sortBy,
    setSortBy, // scaffold — wire to sort UI later
    extraFilters,
    setExtraFilters, // scaffold — wire to filter UI later
    onSearch,
    getRandomCard,
    getMoreCards,
    clearResults,
  };
}
