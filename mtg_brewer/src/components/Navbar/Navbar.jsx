import { Link } from "react-router";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/decks">Decks</Link>
      <Link to="/search">Search</Link>
    </nav>
  );
}
