import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------
// CONEXIÓN A MYSQL (RAILWAY)
// ----------------------------
let pool;

try {
  pool = mysql.createPool({
    uri: process.env.MYSQL_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log("✅ Conectado a MySQL correctamente");
} catch (error) {
  console.error("❌ Error al conectar a MySQL:", error);
}

// ----------------------------
// RUTAS
// ----------------------------

// GET -> obtener todas las tareas
app.get("/tasks", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tasks ORDER BY createdAt DESC");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener tareas:", error);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// POST -> crear una tarea
app.post("/tasks", async (req, res) => {
  try {
    const { name, description, status, type, priority, who, date } = req.body;

    const [result] = await pool.query(
      `INSERT INTO tasks (name, description, status, type, priority, who, date, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, description, status, type, priority, who, date]
    );

    res.json({ message: "Tarea creada", id: result.insertId });
  } catch (error) {
    console.error("❌ Error al crear tarea:", error);
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// ----------------------------
// ARRANCAR SERVIDOR
// ----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en puerto ${PORT}`);
});
