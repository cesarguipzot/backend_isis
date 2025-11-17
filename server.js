const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "123456",
  database: process.env.MYSQLDATABASE || "backend_isis",
  port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306,
});

// Probar conexión
db.connect((err) => {
  if (err) {
    console.log("Error al conectar con MySQL:", err);
  } else {
    console.log("Conectado a MySQL");
  }
});

// Ruta principal
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// Obtener tareas
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.json({ error: err });
    res.json(results);
  });
});

// Crear tarea
app.post("/tasks", (req, res) => {
  const { name, description, status, type, priority, who, date } = req.body;

  const query = `
    INSERT INTO tasks (name, description, status, type, priority, who, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, description, status, type, priority, who, date],
    (err, result) => {
      if (err) return res.json({ error: err });
      res.json({ message: "Tarea creada", id: result.insertId });
    }
  );
});

// Arranque del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
