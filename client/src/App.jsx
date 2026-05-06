import { useContext } from "react";
import { Link } from "react-router";
import { AuthContext } from "./auth/AuthContext";
import "./App.css";

/* Inline icons to avoid extra dependency */
const IconDecks = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h6v2H5v14h14v-4h2v6H3V3zm12 0h6v6h-2V5.83l-8.59 8.58L9 13l8.59-8.59H15V3z" />
  </svg>
);

const IconSearch = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const IconPlaytest = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

function App() {
  const { user } = useContext(AuthContext);

  const features = [
    {
      icon: <IconDecks />,
      title: "Deck Manager",
      description:
        "Build, organize, and manage your EDH / Commander decks. Set commanders, track card counts, and keep your brews polished.",
      link: "/decks",
      linkText: "My Decks",
      authRequired: true,
    },
    {
      icon: <IconSearch />,
      title: "Scryfall Search",
      description:
        "Browse the full Magic card database with powerful filters. Search by color, mana cost, type, and more—then add cards straight to your decks.",
      link: "/search",
      linkText: "Search Cards",
      authRequired: false,
    },
    {
      icon: <IconPlaytest />,
      title: "Playtest Simulator",
      description:
        "Test your decks in a simulated game environment. Draw hands, play cards to the battlefield, create tokens, and iterate on your strategy.",
      link: user ? "/decks" : "/search",
      linkText: user ? "Go to Decks" : "Login to Access",
      authRequired: false,
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <h1 className="home-title">Forge Your Commander Deck</h1>
        <p className="home-subtitle">
          The ultimate EDH brewing tool—search cards, build decks, and playtest
          your strategy before game night.
        </p>
        <div className="home-hero-actions">
          {user ? (
            <Link to="/decks">
              <span className="button-top">My Decks</span>
            </Link>
          ) : (
            <Link to="/register">
              <span className="button-top">Get Started</span>
            </Link>
          )}
          <Link to="/search">
            <span className="button-top" style={{ background: "var(--surface-2)", color: "var(--text)" }}>
              Search Cards
            </span>
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="home-features">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.description}</p>
            {(!f.authRequired || user) ? (
              <Link to={f.link}>
                <span className="button-top">{f.linkText}</span>
              </Link>
            ) : (
              <Link to="/login">
                <span className="button-top">Login to Access</span>
              </Link>
            )}
          </div>
        ))}
      </section>

      {/* Conditional bottom section */}
      <section className="home-bottom">
        {user ? (
          <p>
            Welcome back, <strong>{user.username || "Planeswalker"}</strong>.
            Ready to brew something new?
          </p>
        ) : (
          <p>
            <Link to="/login">Log in</Link> or{" "}
            <Link to="/register">register</Link> to start saving decks.
          </p>
        )}
      </section>
    </div>
  );
}

export default App;
