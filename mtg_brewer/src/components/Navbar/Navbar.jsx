import { Link } from "react-router";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav>
      <Link class to="/">
        <span className="button-top">Home</span>
      </Link>
      <Link to="/decks">
        <span className="button-top">Decks</span>
      </Link>
      <Link to="/search">
        <span className="button-top">Search</span>
      </Link>
    </nav>
  );
}
