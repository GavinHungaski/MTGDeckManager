import express from "express";
import cors from "cors";

import {
  getAllDecks,
  getDeckById,
  createDeck,
  deleteDeck,
} from "./controllers/deckController.js";

import {
  addCard,
  removeCard,
  toggleCommander,
} from "./controllers/cardController.js";

import pool from "./db/db.js";

const PORT = 4000;
const app = express();

app.use(express.json());
app.use(cors());

// Quick check to see if the db is working
pool.connect().catch((err) => {
  console.error("Failed to connect to PostgreSQL:", err);
  process.exit(1);
});

/** Deck Routes */
app.get("/api/decks", getAllDecks);
app.get("/api/decks/:id", getDeckById);
app.post("/api/deck", createDeck);
app.delete("/api/decks/:id", deleteDeck);

/** Card Routes */
app.post("/api/decks/:deckId/card", addCard);
app.delete("/api/decks/:deckId/card/:cardId", removeCard);
app.patch("/api/decks/:deckId/card/:cardId/commander", toggleCommander);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
