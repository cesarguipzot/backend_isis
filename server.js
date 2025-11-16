const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "backend_isis"
});

db.connect((err) => {
  if (err) {
    console.log("Error de conexión MySQL", err);
  } else {
    console.log("Conectado a MySQL 🚀");
  }
});

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// GET all tasks
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.json({ error: err });
    res.json(results);
  });
});

// POST new task
app.post("/tasks", (req, res) => {
  const { name, description, status, type, priority, who, date } = req.body;

  const query = `
    INSERT INTO tasks (name, description, status, type, priority, who, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, description, status, type, priority, who, date], (err, result) => {
    if (err) return res.json({ error: err });
    res.json({ message: "Tarea creada", id: result.insertId });
  });
});

// Obtener todas las tareas
app.get("/tasks", (req, res) => {
  const query = "SELECT * FROM tasks ORDER BY id DESC";
  db.query(query, (err, results) => {
    if (err) return res.json({ error: err });
    res.json(results);
  });
});


const PORT = 3000;
app.listen(PORT, () => console.log("Servidor corriendo en http://localhost:" + PORT));
