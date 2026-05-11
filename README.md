# MTG Commander Deck Manager

> A full-stack web application for building, analyzing, and playtesting Magic: The Gathering — Commander (EDH) decks.

[![Deployed on Railway](https://img.shields.io/badge/Deployed%20on-Railway-0B0D0E?logo=railway)](https://railway.com/project/3c14ab9c-0271-4066-93b5-069337ca38e2/service/1aeb22e5-5fa5-451b-9708-ed27111ac8c0?environmentId=bf1bfc0d-c3a0-4c18-a184-f36e1f3d1bb2)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)

---

## Live Demo

The app is deployed and live on Railway:

**https://railway.com/project/3c14ab9c-0271-4066-93b5-069337ca38e2/service/1aeb22e5-5fa5-451b-9708-ed27111ac8c0?environmentId=bf1bfc0d-c3a0-4c18-a184-f36e1f3d1bb2**

---

## What is this?

MTG Commander Deck Manager is a purpose-built tool for **Commander/EDH players** who want more than a spreadsheet. Create an account, build unlimited decks with real-time card search powered by Scryfall, dive into rich analytics that break down your mana curve, color identity, and card roles, then **playtest your deck right in the browser** with a full drag-and-drop battlefield simulator.

No more guessing if your deck has enough ramp or removal — the app automatically classifies every card and surfaces the numbers.

---

## Features

### Deck Dashboard
- **My Decks** — Manage all your decks in one place with sortable columns (name, color identity, tags, price, last updated).
- **Smart Filtering** — Filter by text, color identity, and tags.
- **Bulk Actions** — Select multiple decks to delete or tag at once.
- **Tag System** — Create and assign custom tags to organize your collection.
- **Price Tracking** — Automatically fetches and displays deck value in USD using Scryfall pricing data.
- **Guest Mode** — Try the app without creating an account; your data persists for the session.

### Deck Builder
- **Intelligent Card Search** — Search the entire Scryfall database with powerful filters: card name, oracle text, card type, color identity, CMC, power/toughness, set, rarity, keyword abilities, and more.
- **Commander Assignment** — Set commanders with a single click. The app validates color identity and enforces singleton rules for non-basic lands.
- **Quantity Controls** — Easily adjust card counts with inline steppers.
- **Rich Card Previews** — Hover over any card name to see a full-size preview popup.

### Advanced Deck Analytics
- **Mana Curve** — Visual bar chart of converted mana costs across the deck.
- **Color Pip Distribution** — Interactive donut charts showing mana cost colors vs. mana production.
- **Type Distribution** — Breakdown of creatures, instants, sorceries, artifacts, enchantments, lands, planeswalkers, and more.
- **Auto-Detected Card Roles** — Every card is intelligently analyzed and classified into key Commander roles:
  - **Draw** — Card advantage engines
  - **Ramp** — Mana acceleration (lands, treasures, mana rocks, cost reduction)
  - **Removal** — Targeted and mass removal
  - **Protection** — Hexproof, indestructible, ward, counterspells for your board
  - **Tutor** — Library searching (non-land)
  - **Recursion** — Graveyard synergy, reanimation, flashback, dredge, unearth
- **Color Identity Validation** — Automatically flags cards outside your commander's color identity.
- **Interactive Highlighting** — Hover over any stat to highlight the corresponding cards in your decklist in real time.

### Full Playtest Simulator
- **Complete Game Zones** — Deck, hand, battlefield, graveyard, exile, and command zone — all fully functional.
- **Drag & Drop Battlefield** — Arrange your permanents freely on an infinite pan-and-zoom battlefield.
- **Card Manipulation** — Tap/untap, flip, transform, attach (equip/aura), and add custom counters to any card.
- **Token & Counter Creator** — Generate tokens and custom permanents on the fly with a searchable token database.
- **Life & Resource Tracking** — Track life total, energy, poison, experience, and commander damage.
- **Library Manipulation** — Draw, shuffle, scry, and surveil with interactive choice dialogs.
- **Context Menus** — Right-click any card for zone-to-zone movement and game actions.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 6, React Router 7, Vanilla CSS |
| **Backend** | Express 5, Node.js 20+ |
| **Database** | PostgreSQL 15 (via `pg`) |
| **Authentication** | JWT (access + refresh tokens), bcrypt |
| **External API** | Scryfall REST API |
| **Deployment** | Railway |
| **Security** | Helmet, CORS, Express Rate Limit, input validation |

---

## Architecture

This is a **monorepo** with a clear client/server split:

```
mtg-deck-manager/
├── client/          # React 19 + Vite SPA
│   ├── src/
│   │   ├── Dashboard/
│   │   ├── DeckBuilder/
│   │   ├── DeckDetail/
│   │   ├── Playtest/
│   │   ├── Search/
│   │   └── common/  # Reusable components, hooks, context
│   └── dist/        # Production build (served by backend)
├── server/          # Express 5 API
│   ├── src/
│   │   ├── routes/     # Auth, Deck, Card endpoints
│   │   ├── middleware/ # Auth, rate limiting, error handling
│   │   └── db/         # PostgreSQL schema & seed data
│   └── server.js
├── package.json     # Root workspace scripts
└── railway.json     # Railway deployment config
```

**Production Mode:** The backend serves the built React SPA as static files and handles all API routes under `/api/*`, enabling same-origin deployment with no CORS headaches.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) >= 20.0.0
- [PostgreSQL](https://www.postgresql.org/) 15+
- A [Scryfall](https://scryfall.com/) API key (optional — public read endpoints work without auth)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/GavinHungaski/MTGDeckManager.git
   cd MTGDeckManager
   ```

2. **Install dependencies** (installs both client and server)
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your PostgreSQL credentials and JWT secret
   ```

4. **Run the database migrations**
   ```bash
   cd server
   node db/migrate.js
   ```

5. **Start the development servers**
   ```bash
   cd ..
   npm run dev
   ```
   This concurrently starts:
   - Backend API on `http://localhost:3000`
   - Frontend dev server on `http://localhost:5173`

---

## Deployment

This project is configured for seamless deployment on **Railway** via `railway.json`:

```json
{
  "build": { "builder": "RAILPACK", "buildCommand": "npm run build" },
  "deploy": { "startCommand": "npm start", "restartPolicyType": "ON_FAILURE" }
}
```

**Deploy steps:**
1. Connect your GitHub repo to a new Railway project.
2. Add a PostgreSQL service in Railway.
3. Set the required environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.).
4. Railway automatically builds (`npm run build`) and starts (`npm start`) the app.

---

## Screenshots

*Screenshots coming soon — check out the [live demo](https://railway.com/project/3c14ab9c-0271-4066-93b5-069337ca38e2/service/1aeb22e5-5fa5-451b-9708-ed27111ac8c0?environmentId=bf1bfc0d-c3a0-4c18-a184-f36e1f3d1bb2) in the meantime!*

---

## License

ISC © MTG Deck Manager Team
