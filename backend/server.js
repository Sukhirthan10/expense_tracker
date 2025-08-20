const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// ====== DB Setup ======
mongoose.connect("mongodb://127.0.0.1:27017/expenseTracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ====== Models ======
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const ExpenseSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true, trim: true },
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Expense = mongoose.model("Expense", ExpenseSchema);

// ====== Auth Middleware ======
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, "secretKey");
    req.user = decoded;
    next();
  } catch {
    res.status(400).json({ error: "Invalid token" });
  }
};

// ====== Routes ======
// Register
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: "User registered" });
});

// Login
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });
  const token = jwt.sign({ id: user._id }, "secretKey");
  res.json({ token });
});

// Add Expense (with validation)
app.post("/expenses", auth, async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !category || amount === undefined || amount === null) {
      return res.status(400).json({ error: "title, amount, and category are required" });
    }

    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: "amount must be a positive number" });
    }

    const expense = new Expense({
      userId: req.user.id,
      title: String(title).trim(),
      amount: amt,
      category: String(category).trim(),
      date: date ? new Date(date) : new Date(), // ✅ use frontend date or now
    });

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// Get Expenses
app.get("/expenses", auth, async (req, res) => {
  const expenses = await Expense.find({ userId: req.user.id });
  res.json(expenses);
});

// Delete Expense
app.delete("/expenses/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Deleted", id });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
