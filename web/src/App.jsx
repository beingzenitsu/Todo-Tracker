import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import TodoList from "./components/TodoList";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");


  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken("");
    setUsername("");
  };

  if (!token) {
    return <LoginForm setToken={setToken} setUsername={setUsername} />;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
     
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span style={{ color: "white", fontWeight: "bold" }}>
          Welcome{username ? `, ${username}` : ""}!
        </span>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <h1>Todo Tracker</h1>
      <TodoList token={token} />
    </div>
  );
}

export default App;
