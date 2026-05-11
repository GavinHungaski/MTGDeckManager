# MTG EDH Deck Manager

Welcome to the Ultimate MTG EDH Deck Brewing Tool!

A full-stack web application for building, managing, and playtesting Magic: The Gathering Commander (EDH) decks.

## Features

- 🃏 **Deck Management** - Create, edit, and organize your Commander decks
- 🔍 **Card Search** - Search and browse cards using the Scryfall API
- 👤 **User Authentication** - Secure user accounts with JWT authentication
- 🎮 **Playtest Mode** - Simulate games with your decks
- 💰 **Price Tracking** - View deck prices from Scryfall data
- 🎨 **Color Identity** - Automatic color identity validation
- 📊 **Deck Statistics** - Card counts, mana curves, and more

## Tech Stack

### Backend
- **Node.js** with Express 5
- **PostgreSQL** (AWS RDS)
- **JWT** authentication
- **bcrypt** for password hashing
- **AES-256-GCM** encryption for sensitive data
- **Winston** logging
- **Helmet** security headers
- **Rate limiting** with express-rate-limit

### Frontend
- **React 19** with React Router
- **Vite** build tool
- **Axios** for API calls
- **React Konva** for playtest canvas
- **Mana Font** for MTG mana symbols

### Database
- **PostgreSQL** on AWS RDS
- UUID primary keys
- Encrypted user emails
- JSONB for card data storage

## Project Structure

```
MTGDeckManager/
├── server/                 # Backend API
│   ├── server.js          # Entry point
│   ├── src/
│   │   ├── app.js         # Express configuration
│   │   ├── config/        # Database & environment config
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, validation, error handling
│   │   └── utils/         # Logger utilities
│   └── db/
│       └── init_db.sql    # Database schema
├── client/                # Frontend React app
│   ├── src/
│   │   ├── main.jsx       # App entry point
│   │   ├── auth/          # Authentication components
│   │   ├── services/      # API service layer
│   │   ├── Decks/         # Deck list view
│   │   ├── DeckDetail/    # Deck editor
│   │   ├── Search/        # Card search
│   │   └── Playtest/      # Game simulator
│   └── vite.config.js
└── REFACTORING_NOTES.md   # Detailed architecture docs
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GavinHungaski/MTGDeckManager.git
   cd MTGDeckManager
   ```

2. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb mtg_brewer
   
   # Run the schema
   psql -d mtg_brewer -f server/db/init_db.sql
   ```

3. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   PORT=8080
   NODE_ENV=development
   
   # Database
   PGUSER=postgres
   PGPASSWORD=your_password
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=mtg_brewer
   
   # Security (generate secure random strings!)
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   ENCRYPTION_KEY=your-32-character-encryption-key
   
   # CORS
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

5. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - Health check: http://localhost:8080/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Decks
- `GET /api/decks` - Get all user's decks
- `GET /api/decks/:id` - Get specific deck
- `POST /api/decks` - Create new deck
- `DELETE /api/decks/:id` - Delete deck

### Cards
- `POST /api/cards/decks/:deckId/card` - Add card to deck
- `DELETE /api/cards/decks/:deckId/card/:cardId` - Remove card
- `PATCH /api/cards/decks/:deckId/card/:cardId/commander` - Toggle commander
- `PUT /api/cards/decks/:deckId/card/:cardId/count` - Update quantity

## Deployment

### Railway Deployment (Recommended)
This application is configured for easy deployment on [Railway](https://railway.app/).

#### 1. Prerequisites
- A Railway account (sign up at [railway.app](https://railway.app))
- Your code pushed to a GitHub repository

#### 2. Create a PostgreSQL Database
- In your Railway dashboard, create a new **PostgreSQL** project.
- Railway will automatically provide a `DATABASE_URL` environment variable.
- Initialize the database by running the `schema.sql` script against your Railway Postgres instance.

#### 3. Deploy the Application
- Create a new **Empty Project** in Railway.
- Choose **Deploy from GitHub repo** and select your repository.
- Railway will detect the `railway.json` and root `package.json` to handle the build and start process automatically.

#### 4. Environment Variables
In your Railway project dashboard, go to the **Variables** tab and add the following:

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Required |
| `JWT_SECRET` | `<generate-a-strong-secret>` | Used for signing auth tokens |
| `ENCRYPTION_KEY` | `<32-character-key>` | Used for encrypting sensitive data |
| `DATABASE_URL` | *Provided by Railway Postgres* | Should already exist if you linked Postgres |

> **Note:** You do **not** need to set `PGHOST`, `PGPORT`, `PGUSER`, etc., manually. The app is configured to automatically parse the `DATABASE_URL` provided by Railway.

#### 5. Link the Database
- In your Railway project, go to the service settings.
- Under **Networking**, link your PostgreSQL service to your app service. This injects the `DATABASE_URL` into the app's environment.

#### 6. Generate Domain
- Once deployed, go to your app service settings in Railway.
- Under **Networking**, click **Generate Domain** to get a public URL for your application.

Your app will be live at the generated domain, with the frontend and backend served from the same origin.

## Security Features

- 🔐 JWT token authentication
- 🔒 AES-256-GCM email encryption
- 🛡️ Helmet security headers
- ⏱️ Rate limiting on API endpoints
- 🔑 bcrypt password hashing
- ✅ Input validation with express-validator
- 🚫 SQL injection prevention with parameterized queries

## Development

### Running Tests
```bash
# Backend tests (when implemented)
cd server
npm test

# Frontend tests (when implemented)
cd client
npm test
```

### Code Style
- ESLint for JavaScript/React
- Prettier for formatting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Useful Links

- [Scryfall API Documentation](https://scryfall.com/docs/api)
- [Mana Font Icons](https://mana.andrewgioia.com/index.html)
- [MTG Commander Format Rules](https://mtgcommander.net/index.php/rules/)

## License

ISC

## Acknowledgments

- Card data provided by [Scryfall](https://scryfall.com/)
- Mana symbols from [Mana Font](https://mana.andrewgioia.com/)
- Built with ❤️ for the MTG Commander community

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Note:** This project is not affiliated with or endorsed by Wizards of the Coast.
