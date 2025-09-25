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

app.get("/api/notas/:materiaId/:gradoId", async (req, res) => {
  const { materiaId, gradoId } = req.params;
  try {
    const q = `
      SELECT e.nombre  AS estudiante,
             n.examen1, n.examen2, n.examen_final,
             n.h1, n.h2, n.h3, n.h4
      FROM notas n
      JOIN estudiantes e ON e.id = n.estudiante_id
      WHERE n.materia_id = $1
        AND n.grado_id   = $2
      ORDER BY e.nombre;
    `;
    const { rows } = await pool.query(q, [materiaId, gradoId]);
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo notas:", err);
    res.status(500).json({ error: "Error obteniendo notas" });
  }
});


app.get("/api/materias/name/:nombre", async (req, res) => {
  console.log("🔍 Parámetro recibido en ruta:", req.params.nombre);
  try {
    const nombre = req.params.nombre;

    const q = `
      SELECT * FROM materias
      WHERE unaccent(lower(nombre)) = unaccent(lower($1))
      LIMIT 1
    `;
    const result = await pool.query(q, [nombre]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Materia no encontrada" });
    }
  } catch (err) {
    console.error("Error buscando materia por nombre:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get("/api/grados/name/:nombre", async (req, res) => {
  const { nombre } = req.params;
  try {
    const q = `SELECT id, nombre FROM grados WHERE nombre ILIKE $1 LIMIT 1`;
    const result = await pool.query(q, [nombre]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Grado no encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error buscando grado:", err);
    res.status(500).json({ error: "Error buscando grado" });
  }
});

app.post("/api/notas", async (req, res) => {
  const { materiaId, gradoId, estudiantes } = req.body;
  if (!materiaId || !gradoId || !Array.isArray(estudiantes)) {
    return res.status(400).json({ error: "Faltan materiaId, gradoId o estudiantes" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const fila of estudiantes) {
      // 1) Obtener o crear estudiante_id
      const estudiante_id = await getIdOrCreate(client, "estudiantes", fila.estudiante);
      // 2) Desestructurar notas
      const { examen1, examen2, examen_final, h1, h2, h3, h4 } = fila.notas;
      // 3) INSERT … ON CONFLICT
      await client.query(
        `INSERT INTO notas
           (estudiante_id, materia_id, grado_id,
            examen1, examen2, examen_final,
            h1, h2, h3, h4)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (estudiante_id, materia_id, grado_id)
         DO UPDATE SET
           examen1      = EXCLUDED.examen1,
           examen2      = EXCLUDED.examen2,
           examen_final = EXCLUDED.examen_final,
           h1           = EXCLUDED.h1,
           h2           = EXCLUDED.h2,
           h3           = EXCLUDED.h3,
           h4           = EXCLUDED.h4,
           updated_at   = NOW()`,
        [
          estudiante_id,
          materiaId,
          gradoId,
          examen1,
          examen2,
          examen_final,
          h1,
          h2,
          h3,
          h4
        ]
      );
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));


module.exports = app;
