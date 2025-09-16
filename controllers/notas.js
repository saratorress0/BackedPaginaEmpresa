import pool from "../utils/config.js";  // tu conexión PostgreSQL

// Obtener notas de una materia
export const getNotas = async (req, res) => {
  try {
    const { materia, grado } = req.params;
    const result = await pool.query(
      "SELECT * FROM notas WHERE materia = $1 AND grado = $2",
      [materia, grado]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Guardar/actualizar notas
export const saveNotas = async (req, res) => {
  try {
    const { materia, grado, estudiantes } = req.body;

    for (const est of estudiantes) {
      await pool.query(
        `INSERT INTO notas (estudiante, materia, grado, examen1, examen2, examen_final, h1, h2, h3, h4)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (estudiante, materia, grado) 
         DO UPDATE SET examen1=$4, examen2=$5, examen_final=$6, h1=$7, h2=$8, h3=$9, h4=$10`,
        [est.estudiante, materia, grado, ...est.notas]
      );
    }

    res.json({ message: "Notas guardadas correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


