import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "./controllers/userController.js";
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
import { authenticate } from "./middleware/auth.js";

const PORT = 4000;
const app = express();

app.use(express.json());
app.use(cors());

// --------------------
// Auth routes
// --------------------
app.post("/api/users/register", registerUser);
app.post("/api/users/login", loginUser);
app.get("/api/users/me", authenticate, getCurrentUser);

// --------------------
// Deck routes
// --------------------
app.get("/api/decks", authenticate, getAllDecks);
app.get("/api/decks/:id", authenticate, getDeckById);
app.post("/api/deck", authenticate, createDeck);
app.delete("/api/decks/:id", authenticate, deleteDeck);

// --------------------
// Card routes
// --------------------
app.post("/api/decks/:deckId/card", authenticate, addCard);
app.delete("/api/decks/:deckId/card/:cardId", authenticate, removeCard);
app.patch(
  "/api/decks/:deckId/card/:cardId/commander",
  authenticate,
  toggleCommander,
);

// --------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
