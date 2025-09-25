-- crear tablas
CREATE TABLE IF NOT EXISTS estudiantes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS grados (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS notas (
  id SERIAL PRIMARY KEY,
  estudiante_id INT REFERENCES estudiantes(id) ON DELETE CASCADE,
  materia_id INT REFERENCES materias(id) ON DELETE CASCADE,
  grado_id INT REFERENCES grados(id) ON DELETE CASCADE,
  examen1 NUMERIC,
  examen2 NUMERIC,
  examen_final NUMERIC,
  h1 NUMERIC,
  h2 NUMERIC,
  h3 NUMERIC,
  h4 NUMERIC,
  autoevaluac NUMERIC,
  heteroeval NUMERIC,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);


INSERT INTO materias (nombre) VALUES ('matemáticas') ON CONFLICT DO NOTHING;
INSERT INTO grados (nombre) VALUES ('9-1') ON CONFLICT DO NOTHING;

INSERT INTO estudiantes (nombre) VALUES ('Juan Pérez') ON CONFLICT DO NOTHING;
INSERT INTO estudiantes (nombre) VALUES ('María Gómez') ON CONFLICT DO NOTHING;
INSERT INTO estudiantes (nombre) VALUES ('Carlos Ruiz') ON CONFLICT DO NOTHING;


WITH m AS (SELECT id AS mid FROM materias WHERE nombre='matemáticas'),
     g AS (SELECT id AS gid FROM grados WHERE nombre='9-1')
INSERT INTO notas (estudiante_id, materia_id, grado_id, examen1, examen2, examen_final)
SELECT e.id, m.mid, g.gid, NULL, NULL, NULL
FROM estudiantes e, m, g
ON CONFLICT DO NOTHING;

ALTER TABLE notas
ADD CONSTRAINT uq_notas_composite
UNIQUE(estudiante_id, materia_id, grado_id);

