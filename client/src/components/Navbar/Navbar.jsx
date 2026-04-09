import { Link } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import { useNavigate } from "react-router";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const logoutHandler = () => {
    logout();
    navigate("/");
  };

  return (
    <nav>
      <Link to="/">
        <span className="button-top">Home</span>
      </Link>
      {user && (
        <Link to="/decks">
          <span className="button-top">Decks</span>
        </Link>
      )}
      <Link to="/search">
        <span className="button-top">Search</span>
      </Link>
      {"|"}
      {user ? (
        <button onClick={logoutHandler}>
          <span className="button-top">Logout</span>
        </button>
      ) : (
        <>
          <Link to="/login">
            <span className="button-top">Login</span>
          </Link>
          <Link to="/register">
            <span className="button-top">Register</span>
          </Link>
        </>
      )}
    </nav>
  );
}
