const express = require("express");
const cors = require("cors");
const dbModule = require("./db.js"); 

const pool = dbModule.pool ? dbModule.pool : dbModule;

const app = express();
app.use(cors());
app.use(express.json());

async function getIdOrCreate(client, table, nombre) {
  const sel = `SELECT id FROM ${table} WHERE nombre = $1`;
  const r = await client.query(sel, [nombre]);
  if (r.rowCount > 0) return r.rows[0].id;
  const ins = `INSERT INTO ${table} (nombre) VALUES ($1) RETURNING id`;
  const r2 = await client.query(ins, [nombre]);
  return r2.rows[0].id;
}

app.get("/api/estudiantes", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre FROM estudiantes ORDER BY nombre");
    res.json(result.rows);
  } catch (err) {
    console.error("Error listando estudiantes:", err);
    res.status(500).json({ error: "Error listando estudiantes" });
  }
});

app.get("/api/notas/:materia/:grado", async (req, res) => {
  const { materia, grado } = req.params;
  try {
    const q = `
      SELECT e.nombre AS estudiante, n.columna, n.nota
      FROM notas n
      JOIN estudiantes e ON e.id = n.estudiante_id
      JOIN materias m ON m.id = n.materia_id
      JOIN grados g ON g.id = n.grado_id
      WHERE m.nombre = $1 AND g.nombre = $2
      ORDER BY e.nombre;
    `;
    const result = await pool.query(q, [materia, grado]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo notas:", err);
    res.status(500).json({ error: "Error obteniendo notas" });
  }
});

app.post("/api/notas", async (req, res) => {
  const { materia, grado, estudiantes } = req.body;
  if (!materia || !grado || !Array.isArray(estudiantes)) {
    return res.status(400).json({ error: "Faltan campos: materia, grado o estudiantes" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const materia_id = await getIdOrCreate(client, "materias", materia);
    const grado_id = await getIdOrCreate(client, "grados", grado);

    for (const fila of estudiantes) {
      const estudianteNombre = fila.estudiante;
      const notasObj = fila.notas || {};

      const estudiante_id = await getIdOrCreate(client, "estudiantes", estudianteNombre);

      for (const [columna, valor] of Object.entries(notasObj)) {

        const notaVal = valor === "" ? null : valor;
        await client.query(
          `INSERT INTO notas (estudiante_id, materia_id, grado_id, columna, nota)
           VALUES ($1,$2,$3,$4,$5)
           ON CONFLICT (estudiante_id, materia_id, grado_id, columna)
           DO UPDATE SET nota = EXCLUDED.nota, updated_at = now()`,
          [estudiante_id, materia_id, grado_id, columna, notaVal]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Notas guardadas" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error guardando notas:", err);
    res.status(500).json({ error: "Error guardando notas" });
  } finally {
    client.release();
  }
});

module.exports = app;
