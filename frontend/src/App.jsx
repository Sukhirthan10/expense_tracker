import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#FF4444"];

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [filterMonth, setFilterMonth] = useState("All");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const token = localStorage.getItem("token");

  // fetch expenses when logged in
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setExpenses(res.data || []))
        .catch((err) => console.error(err));
    }
  }, [token]);

  // add expense
  const addExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/expenses",
        { title, amount, category, date: new Date(date) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses([...expenses, res.data]);
      setTitle("");
      setAmount("");
      setCategory("Food");
      setDate(new Date().toISOString().slice(0, 16));
    } catch (err) {
      console.error(err);
    }
  };

  // delete expense
  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // login / register
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "login" : "register";
      const res = await axios.post(`http://localhost:5000/auth/${endpoint}`, {
        username,
        password,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        window.location.reload();
      } else {
        alert(res.data.message || "Success, now login!");
        if (!isLogin) setIsLogin(true);
      }
    } catch (err) {
      alert("Authentication failed");
    }
  };

  // group by month
  const groupByMonth = (items) => {
    const grouped = {};
    items.forEach((exp) => {
      const month = new Date(exp.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(exp);
    });
    return grouped;
  };

  const groupedExpenses = groupByMonth(expenses);

  // pie chart data
  const pieData = (() => {
    let dataToUse = expenses;
    if (filterMonth !== "All") {
      dataToUse = expenses.filter(
        (e) =>
          new Date(e.date).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }) === filterMonth
      );
    }
    const sums = {};
    dataToUse.forEach((e) => {
      sums[e.category] = (sums[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(sums).map(([name, value]) => ({ name, value }));
  })();

  // ===================== UI =====================
  if (!token) {
    // 🔹 Show Login/Register
    return (
      <div style={{ padding: "20px" }}>
         <h1 style={{ fontSize: "50px", marginBottom: "20px" }}>
    Expense Tracker by Sukhirthan
  </h1>
        <h2>{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleAuth}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)}>
          Switch to {isLogin ? "Register" : "Login"}
        </button>
      </div>
    );
  }

  // 🔹 Show Expenses + Logout
  return (
    <div style={{ padding: "20px", position: "relative" }}>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "red",
          color: "white",
          padding: "8px 12px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      <h2>Add Expense</h2>
      <form onSubmit={addExpense}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="Food">Food</option>
          <option value="Snacks">Snacks</option>
          <option value="Laundry">Laundry</option>
          <option value="Travel">Travel</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">Add Expense</button>
      </form>

      <h2>Expenses</h2>
      {Object.keys(groupedExpenses).map((month) => {
        const monthTotal = groupedExpenses[month].reduce((a, b) => a + Number(b.amount), 0);
        return (
          <div key={month} style={{ marginBottom: "20px" }}>
            <h3>
              {month} – Total: ₹{monthTotal}
            </h3>
            <ul>
              {groupedExpenses[month].map((exp) => (
                <li
                  key={exp._id}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    {exp.title} – ₹{exp.amount} ({exp.category}) <br />
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
        );
      })}

      <h2>Spending Breakdown</h2>
      <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
        <option value="All">All Time</option>
        {Object.keys(groupedExpenses).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <PieChart width={600} height={600}>
  <Pie
    data={pieData}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={150}
    label={({ name, percent }) =>
      `${name} ${(percent * 100).toFixed(0)}%`
    }
    labelStyle={{ fill: "#000000", fontWeight: "bold" }} // makes text visible
  >
    {pieData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={[
          "#2E7D32", // Dark Green
          "#C62828", // Red
          "#1565C0", // Blue
          "#FF8F00", // Orange
          "#6A1B9A", // Purple
          "#00838F", // Teal
          "#D81B60", // Pink
          "#FBC02D"  // Yellow
        ][index % 8]}
      />
    ))}
  </Pie>
  <Tooltip contentStyle={{ backgroundColor: "#ffffff", color: "#000000" }} />
  <Legend wrapperStyle={{ color: "#000000", fontWeight: "bold" }} />
</PieChart>

    </div>
  );
};

export default App;
