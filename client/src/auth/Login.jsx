import { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      errors.password = "Password is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (validationErrors.email) {
      if (!value) {
        setValidationErrors(prev => ({ ...prev, email: "Email is required" }));
      } else if (validateEmail(value)) {
        setValidationErrors(prev => ({ ...prev, email: null }));
      } else {
        setValidationErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (validationErrors.password && value) {
      setValidationErrors(prev => ({ ...prev, password: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    try {
      await login({ email, password });
      navigate("/decks");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <h2 style={{ marginBottom: "1rem", color: "#333" }}>Login</h2>
      
      {error && (
        <div style={{
          color: "#dc3545",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          padding: "0.75rem 1rem",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}>
          {error}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "#333" }}>
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: validationErrors.email ? "2px solid #dc3545" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            boxSizing: "border-box",
          }}
        />
        {validationErrors.email && (
          <p style={{
            color: "#dc3545",
            fontSize: "0.875rem",
            margin: "0.25rem 0 0 0",
          }}>
            {validationErrors.email}
          </p>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "#333" }}>
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: validationErrors.password ? "2px solid #dc3545" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            boxSizing: "border-box",
          }}
        />
        {validationErrors.password && (
          <p style={{
            color: "#dc3545",
            fontSize: "0.875rem",
            margin: "0.25rem 0 0 0",
          }}>
            {validationErrors.password}
          </p>
        )}
      </div>

      <button 
        type="submit"
        style={{
          padding: "0.75rem 2rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          cursor: "pointer",
          marginTop: "1rem",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <span className="button-top">Login</span>
      </button>
    </form>
  );
}