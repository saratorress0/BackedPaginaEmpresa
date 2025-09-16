import express from "express";
import cors from "cors";
import pool from "./db.js"; // 👈 conexión a PG

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Guardar notas
app.post("/api/notas", async (req, res) => {
  try {
    const { materia, grado, estudiante, notas } = req.body;
    for (const [columna, nota] of Object.entries(notas)) {
      await pool.query(
        `INSERT INTO notas (estudiante, materia, grado, columna, nota)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (estudiante, materia, grado, columna)
         DO UPDATE SET nota = EXCLUDED.nota`,
        [estudiante, materia, grado, columna, nota]
      );
    }
    res.json({ message: "Notas guardadas con éxito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error guardando notas" });
  }
});

// ✅ Obtener notas
app.get("/api/notas/:materia/:grado", async (req, res) => {
  try {
    const { materia, grado } = req.params;
    const result = await pool.query(
      `SELECT estudiante, columna, nota FROM notas WHERE materia=$1 AND grado=$2`,
      [materia, grado]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notas" });
  }
});

app.listen(3003, () => console.log("Servidor corriendo en http://localhost:3003"));
