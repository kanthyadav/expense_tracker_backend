const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Backend running");
});

// =======================
// AUTH: SIGNUP
// =======================
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("All fields required");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql =
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("User already exists");
    }
    res.send("Signup successful");
  });
});

// =======================
// AUTH: LOGIN
// =======================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("All fields required");
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send("DB error");
    if (results.length === 0)
      return res.status(401).send("Invalid credentials");

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).send("Invalid credentials");

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});

// =======================
// EXPENSE APIs
// =======================

// ADD expense (REAL user_id)
app.post("/expense", (req, res) => {
  const { title, amount, user_id } = req.body;

  if (!title || !amount || !user_id) {
    return res.status(400).send("Invalid data");
  }

  const sql =
    "INSERT INTO expenses (title, amount, user_id) VALUES (?, ?, ?)";
  db.query(sql, [title, amount, user_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB error");
    }
    res.send("Expense saved");
  });
});

// GET expenses for specific user
app.get("/expenses/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = "SELECT * FROM expenses WHERE user_id = ?";
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB error");
    }
    res.json(results);
  });
});

// DELETE expense
app.delete("/expense/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM expenses WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB error");
    }
    res.send("Expense deleted");
  });
});

// =======================
// SERVER
// =======================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

