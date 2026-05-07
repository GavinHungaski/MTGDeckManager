import { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("one number");
    }
    return errors;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!username) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (username.length > 50) {
      errors.username = "Username must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = "Username can only contain letters, numbers, and underscores";
    }
    
    if (!email) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      errors.password = "Password is required";
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        errors.password = `Password must contain: ${passwordErrors.join(", ")}`;
      }
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (validationErrors.username) {
      if (!value) {
        setValidationErrors(prev => ({ ...prev, username: "Username is required" }));
      } else if (value.length >= 3 && value.length <= 50 && /^[a-zA-Z0-9_]+$/.test(value)) {
        setValidationErrors(prev => ({ ...prev, username: null }));
      } else if (value.length < 3) {
        setValidationErrors(prev => ({ ...prev, username: "Username must be at least 3 characters" }));
      } else if (value.length > 50) {
        setValidationErrors(prev => ({ ...prev, username: "Username must be less than 50 characters" }));
      } else {
        setValidationErrors(prev => ({ ...prev, username: "Username can only contain letters, numbers, and underscores" }));
      }
    }
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
    if (validationErrors.password || validationErrors.confirmPassword) {
      const passwordErrors = validatePassword(value);
      if (passwordErrors.length === 0 && value) {
        setValidationErrors(prev => ({ ...prev, password: null }));
      } else if (value) {
        setValidationErrors(prev => ({ 
          ...prev, 
          password: `Password must contain: ${passwordErrors.join(", ")}` 
        }));
      } else {
        setValidationErrors(prev => ({ ...prev, password: "Password is required" }));
      }
      
      if (confirmPassword && value === confirmPassword) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
      } else if (confirmPassword && value !== confirmPassword) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (validationErrors.confirmPassword) {
      if (!value) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: "Please confirm your password" }));
      } else if (value === password) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: null }));
      } else {
        setValidationErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({ username, email, password });
      navigate("/decks");
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const isRateLimited = err.response?.status === 429;
      setError({
        message: serverMessage || err.message || "Registration failed",
        isRateLimited,
      });
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    
    const requirements = [
      { test: (p) => p.length >= 8, label: "8+ characters" },
      { test: (p) => /[A-Z]/.test(p), label: "Uppercase letter" },
      { test: (p) => /[a-z]/.test(p), label: "Lowercase letter" },
      { test: (p) => /[0-9]/.test(p), label: "Number" },
    ];
    
    return requirements.map(req => ({
      met: req.test(password),
      label: req.label
    }));
  };

  const passwordStrength = getPasswordStrength();

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
      <h2 style={{ marginBottom: "1rem", color: "#333" }}>Create Account</h2>
      
      {error && (
        <div style={{
          color: error.isRateLimited ? "#856404" : "#dc3545",
          backgroundColor: error.isRateLimited ? "#fff3cd" : "#f8d7da",
          border: `1px solid ${error.isRateLimited ? "#ffc107" : "#f5c6cb"}`,
          padding: "0.75rem 1rem",
          borderRadius: "4px",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}>
          {error.message}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "#333" }}>
          Username
        </label>
        <input
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={handleUsernameChange}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: validationErrors.username ? "2px solid #dc3545" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            boxSizing: "border-box",
          }}
        />
        {validationErrors.username && (
          <p style={{
            color: "#dc3545",
            fontSize: "0.875rem",
            margin: "0.25rem 0 0 0",
          }}>
            {validationErrors.username}
          </p>
        )}
        {!validationErrors.username && username && (
          <p style={{
            color: "#28a745",
            fontSize: "0.875rem",
            margin: "0.25rem 0 0 0",
          }}>
            ✓ Username available
          </p>
        )}
      </div>

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
        {!validationErrors.email && email && validateEmail(email) && (
          <p style={{
            color: "#28a745",
            fontSize: "0.875rem",
            margin: "0.25rem 0 0 0",
          }}>
            ✓ Valid email
          </p>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "#333" }}>
          Password
        </label>
        <input
          type="password"
          placeholder="Create a password"
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
        
        {password && passwordStrength && (
          <div style={{
            marginTop: "0.5rem",
            padding: "0.5rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}>
            <p style={{ margin: "0 0 0.25rem 0", fontWeight: "bold", color: "#333" }}>
              Password requirements:
            </p>
            {passwordStrength.map((req, idx) => (
              <p key={idx} style={{
                margin: "0.125rem 0",
                color: req.met ? "#28a745" : "#6c757d",
              }}>
                {req.met ? "✓" : "○"} {req.label}
              </p>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <label style={{ display: "block", marginBottom: "0.5rem", color: "#333" }}>
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: validationErrors.confirmPassword ? "2px solid #dc3545" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
            boxSizing: "border-box",
          }}
        />
        {validationErrors.confirmPassword && (
          <p style={{
            color: "#dc3545",
            fontSize: "0.875rem",
            margin: "0.25rem 0 0 0",
          }}>
            {validationErrors.confirmPassword}
          </p>
        )}
        {!validationErrors.confirmPassword && confirmPassword && password === confirmPassword && (
          <p style={{
            color: "#28a745",
            fontSize: "0.875rem",
            margin: "0.25rem 0 0 0",
          }}>
            ✓ Passwords match
          </p>
        )}
      </div>

      <button 
        type="submit"
        style={{
          padding: "0.75rem 2rem",
          backgroundColor: "#28a745",
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
        <span className="button-top">Register</span>
      </button>

      <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#28a745", textDecoration: "none" }}>
          Log in
        </Link>
      </p>
    </form>
  );
}