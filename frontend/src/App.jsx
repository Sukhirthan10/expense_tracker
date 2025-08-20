import React, { useState, useEffect } from "react";

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState(""); // for "Other"
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const API_URL = "http://localhost:5000";

  // Fetch expenses
  const fetchExpenses = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  // Handle Login
  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.token) {
        setToken(data.token);
        sessionStorage.setItem("token", data.token);
        fetchExpenses(data.token);
      } else {
        setError("Invalid login");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login request failed");
    }
  };

  // Handle Register
  const handleRegister = async () => {
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        setIsRegistering(false);
        setError("Registration successful! Please login.");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register failed:", err);
      setError("Register request failed");
    }
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    sessionStorage.removeItem("token");
    setExpenses([]);
  };

  // Handle add expense
  const handleAddExpense = async () => {
    const finalCategory = category === "Other" ? customCategory : category;
    if (!title || !amount || !finalCategory) {
      setError("All fields are required to add an expense");
      return;
    }
    setError("");

    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category: finalCategory,
          date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setTitle("");
        setAmount("");
        setCategory("");
        setCustomCategory("");
        fetchExpenses(token);
      } else {
        setError("Failed to add expense");
      }
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Add expense request failed");
    }
  };

  // Handle delete expense
  const handleDeleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setExpenses(expenses.filter((exp) => exp._id !== id));
      } else {
        setError("Failed to delete expense");
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError("Delete expense request failed");
    }
  };

  // Load token from session storage on app start
  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchExpenses(savedToken);
    }
  }, []);

  // Handle Enter key
  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Expense Tracker</h1>

      {!token ? (
        <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
          <h2>{isRegistering ? "Register" : "Login"}</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, isRegistering ? handleRegister : handleLogin)}
            style={{ display: "block", margin: "10px auto", padding: "8px", width: "90%" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, isRegistering ? handleRegister : handleLogin)}
            style={{ display: "block", margin: "10px auto", padding: "8px", width: "90%" }}
          />

          <button
            onClick={isRegistering ? handleRegister : handleLogin}
            style={{ padding: "10px 20px", marginTop: "10px" }}
          >
            {isRegistering ? "Register" : "Login"}
          </button>

          <p style={{ marginTop: "15px" }}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "Login here" : "Register here"}
            </span>
          </p>
        </div>
      ) : (
        <div>
          <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
            Logout
          </button>

          <h2>Add Expense</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={(e) => { e.preventDefault(); handleAddExpense(); }}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginBottom: "10px", display: "block" }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ marginBottom: "10px", display: "block" }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ marginBottom: "10px", display: "block" }}
            >
              <option value="">-- Select Category --</option>
              <option value="Food">Food</option>
              <option value="Snacks">Snacks</option>
              <option value="Laundry">Laundry</option>
              <option value="Travel">Travel</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
            {category === "Other" && (
              <input
                type="text"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                style={{ marginBottom: "10px", display: "block" }}
              />
            )}
            <button type="submit">Add Expense</button>
          </form>

          <h2>Expenses</h2>
          <ul>
            {expenses
              .slice() // create a copy to avoid mutating state
              .sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
              .map((exp) => (
                <li
                  key={exp._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.8rem 1rem",
                    borderRadius: "12px",
                    marginBottom: "0.5rem",
                    backgroundColor: "rgba(255,255,255,0.15)"
                  }}
                >
                  <div>
                    {exp.title} - ₹{exp.amount} ({exp.category}) <br />
                    <small>{new Date(exp.date).toLocaleString()}</small>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(exp._id)}
                    style={{ color: "red" }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

        </div>
      )}
    </div>
  );
}

export default App;
