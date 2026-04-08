-- Users table
CREATE TABLE
    users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Decks table linked to users
CREATE TABLE
    decks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Cards table (shared among users)
CREATE TABLE
    cards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        scryfall_id TEXT UNIQUE NOT NULL,
        card_data JSONB NOT NULL
    );

-- Deck cards (deck → card mapping)
CREATE TABLE
    deck_cards (
        deck_id INTEGER REFERENCES decks (id) ON DELETE CASCADE,
        card_id INTEGER REFERENCES cards (id) ON DELETE CASCADE,
        count INTEGER DEFAULT 1,
        is_commander BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (deck_id, card_id)
    );