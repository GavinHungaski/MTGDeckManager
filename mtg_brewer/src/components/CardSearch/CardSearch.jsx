import React, { useState, useEffect, useRef } from "react";
import "./CardSearch.css";

function CardSearch({ addCard }) {
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

  return (
    <div className="card-search">
      <input
        type="text"
        value={search}
        placeholder="Search card..."
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default CardSearch;
