const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'finiquitos.db'));


db.exec(`
  CREATE TABLE IF NOT EXISTS finiquitos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT NOT NULL,
    rut         TEXT NOT NULL,
    fechaNacimiento TEXT,
    direccion   TEXT,
    sistemaPrevisional TEXT,
    afpNombre   TEXT,
    cargo       TEXT,
    fechaInicio TEXT,
    fechaTermino TEXT,
    horasSemanales REAL,
    sueldoBase  REAL,
    afp         REAL,
    salud       REAL,
    cesantia    REAL,
    liquido     REAL,
    creadoEn    TEXT DEFAULT (datetime('now'))
  )
`);

function guardarFiniquito(datos) {
  const stmt = db.prepare(`
    INSERT INTO finiquitos (
      nombre, rut, fechaNacimiento, direccion,
      sistemaPrevisional, afpNombre,
      cargo, fechaInicio, fechaTermino,
      horasSemanales, sueldoBase,
      afp, salud, cesantia, liquido
    ) VALUES (
      @nombre, @rut, @fechaNacimiento, @direccion,
      @sistemaPrevisional, @afpNombre,
      @cargo, @fechaInicio, @fechaTermino,
      @horasSemanales, @sueldoBase,
      @afp, @salud, @cesantia, @liquido
    )
  `);

  const result = stmt.run(datos);
  return result.lastInsertRowid;
}

function obtenerFiniquitos() {
  return db.prepare('SELECT * FROM finiquitos ORDER BY creadoEn DESC').all();
}

function obtenerFiniquitoPorId(id) {
  return db.prepare('SELECT * FROM finiquitos WHERE id = ?').get(id);
}

module.exports = { guardarFiniquito, obtenerFiniquitos, obtenerFiniquitoPorId };