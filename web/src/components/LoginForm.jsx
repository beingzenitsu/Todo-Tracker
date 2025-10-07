import { useState } from "react";
import api from "../api/api"; 

function LoginForm({ setToken, setUsername }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState("");
  const [username, setLocalUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const endpoint = isSignup ? "/auth/signup" : "/auth/login";

    try {
      const response = await api.post(endpoint, { username, email, password });

      if (isSignup) {
        setMessage("Signup successful! Please log in.");
        setIsSignup(false);
        setUsername(""); 
        setEmail("");
        setPassword("");
      } else {
        const { token, username } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        setToken(token);
        setUsername(username);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setMessage(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #6b73ff 0%, #000dff 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#1f1f1f",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          minWidth: "320px",
          maxWidth: "400px",
          width: "90%",
          color: "white",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
          {isSignup ? "Sign Up" : "Login"}
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
      
          {isSignup && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setLocalUsername(e.target.value)}
              required
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #555",
                background: "#2a2a2a",
                color: "white",
                fontSize: "1rem",
              }}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #555",
              background: "#2a2a2a",
              color: "white",
              fontSize: "1rem",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #555",
              background: "#2a2a2a",
              color: "white",
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(90deg, #ff512f, #dd2476)",
              color: "white",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{
              background: "none",
              border: "none",
              color: "#ff512f",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.9rem",
            }}
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        {message && (
          <p
            style={{
              textAlign: "center",
              marginTop: "1rem",
              color: "#ff6b6b",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
