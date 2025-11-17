// server.js
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// Render te da la variable MYSQL_URL automáticamente
const MYSQL_URL = process.env.MYSQL_URL;

if (!MYSQL_URL) {
  console.error("❌ ERROR: MYSQL_URL no está definida en variables de entorno.");
  process.exit(1);
}

let pool;

try {
  pool = mysql.createPool(MYSQL_URL + "?ssl={" + JSON.stringify({
      rejectUnauthorized: false
  }) + "}");
  console.log("✅ Conectado a MySQL (Railway → Render)");
} catch (err) {
  console.error("❌ Error conectando a MySQL:", err);
  process.exit(1);
}

// ----------------------------
//        ENDPOINTS
// ----------------------------

// GET all tasks
app.get("/tasks", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tasks ORDER BY createdAt DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error GET /tasks:", err);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// CREATE task
app.post("/tasks", async (req, res) => {
  try {
    const { id, status, name, description, type, priority, who, date } = req.body;

    const q = `
      INSERT INTO tasks (id, status, name, description, type, priority, who, date, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await pool.query(q, [
      id,
      status,
      name,
      description,
      type,
      priority,
      who,
      date
    ]);

    res.json({ message: "Tarea creada" });
  } catch (err) {
    console.error("❌ Error POST /tasks:", err);
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// ----------------------------
//       START SERVER
// ----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
