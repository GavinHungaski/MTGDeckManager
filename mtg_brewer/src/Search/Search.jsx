import { useSearch } from "./search_hooks/useSearch";
import { useDeckTray } from "./search_hooks/useDeckTray.js";
import { useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import SearchBar from "./search_components/SearchBar";
import CardHover from "./search_components/CardHover";
import { DeckTray } from "./search_components/DeckTray";
import phyrexianMana from "../assets/phyrexian_mana.png";
import "./Search.css";

function Search() {
  const {
    cards,
    loading,
    nextPage,
    colors,
    setColors,
    cmcs,
    setCmcs,
    sortBy,
    setSortBy,
    extraFilters,
    setExtraFilters,
    onSearch,
    getRandomCard,
    getMoreCards,
    clearResults,
  } = useSearch();
  const { decks, addCardToDeck } = useDeckTray();

  const [currentCard, setCurrentCard] = useState(null);
  const [mousePos, setMousePos] = useState([null, null]);

  function handleDragEnd(e) {
    if (e.active && e.over) {
      const deck_id = e.over.id;
      addCardToDeck(currentCard, deck_id);
    }
  }

  return (
    <>
      <div className="search-header">
        <img
          src={phyrexianMana}
          alt="Phyrexian Mana Symbol"
          width="45"
          height="45"
        />
        <h2>Scryfall API</h2>
        <SearchBar
          onSearch={onSearch}
          colors={colors}
          setColors={setColors}
          cmcs={cmcs}
          setCmcs={setCmcs}
          sortBy={sortBy}
          setSortBy={setSortBy}
          extraFilters={extraFilters}
          setExtraFilters={setExtraFilters}
        />
        <button onClick={getRandomCard}>
          <span className="button-top">Random</span>
        </button>
        <button onClick={clearResults}>
          <span className="button-top" style={{ background: "#FF4444" }}>
            Clear
          </span>
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <DndContext onDragEnd={handleDragEnd}>
        <DeckTray decks={decks} />
        <div
          className="results-display"
          onMouseMove={(e) => {
            setMousePos([e.clientX, e.clientY]);
          }}
        >
          <CardHover card={currentCard} mousePos={mousePos} />
          {cards.map((card) => (
            <DraggableCard
              card={card}
              key={card.id}
              setCurrentCard={setCurrentCard}
              currentCard={currentCard}
            />
          ))}
        </div>
      </DndContext>

      {nextPage && (
        <div style={{ backgroundColor: "gray" }}>
          <button onClick={getMoreCards} className="get-more-button">
            <span className="button-top">Load More</span>
          </button>
        </div>
      )}
    </>
  );
}

function DraggableCard({ card, setCurrentCard, currentCard }) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({
    id: card.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  return (
    <div
      onMouseEnter={() => {
        setCurrentCard(card);
      }}
      onMouseLeave={() => {
        setCurrentCard(null);
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
    >
      <img
        className={`card-img ${card.id === (currentCard?.id || 0) ? "top-level" : ""}`}
        src={
          card.image_uris?.normal ||
          card.image_uris?.small ||
          card.card_faces?.[0]?.image_uris?.normal
        }
        alt={card.name}
      />
    </div>
  );
}

export default Search;
