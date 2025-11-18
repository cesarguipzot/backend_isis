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
//        RUTAS CRUD
// ----------------------------

// GET -> todas las tareas
app.get("/tasks", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tasks ORDER BY createdAt DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener tareas:", error);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// GET -> tarea por ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("❌ Error al obtener tarea por ID:", error);
    res.status(500).json({ error: "Error al obtener tarea" });
  }
});

// POST -> crear tarea
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

// PUT -> actualizar tarea completa
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, type, priority, who, date } = req.body;

    const [result] = await pool.query(
      `UPDATE tasks
       SET name = ?, description = ?, status = ?, type = ?, priority = ?, who = ?, date = ?
       WHERE id = ?`,
      [name, description, status, type, priority, who, date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json({ message: "Tarea actualizada correctamente" });

  } catch (error) {
    console.error("❌ Error al actualizar tarea:", error);
    res.status(500).json({ error: "Error al actualizar tarea" });
  }
});

// PATCH -> actualizar UN campo
app.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const keys = Object.keys(fields);
    if (keys.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    const updates = keys.map(key => `${key} = ?`).join(", ");
    const values = keys.map(key => fields[key]);
    values.push(id);

    const [result] = await pool.query(
      `UPDATE tasks SET ${updates} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json({ message: "Tarea actualizada parcialmente" });

  } catch (error) {
    console.error("❌ Error al aplicar PATCH:", error);
    res.status(500).json({ error: "Error al actualizar campos" });
  }
});

// DELETE -> eliminar tarea
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada" });
    }

    res.json({ message: "Tarea eliminada" });

  } catch (error) {
    console.error("❌ Error al eliminar tarea:", error);
    res.status(500).json({ error: "Error al eliminar tarea" });
  }
});


// ----------------------------
// INICIAR SERVIDOR
// ----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en puerto ${PORT}`);
});
