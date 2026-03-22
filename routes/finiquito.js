const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pdfGenerator = require('../services/pdfGenerator');
const db = require('../database/db');

// Configuración de Multer
const storage = multer.memoryStorage(); // guardamos en memoria, no en disco
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo por archivo
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'foto') {
      const allowed = ['image/jpeg', 'image/png'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error('La foto debe ser JPG o PNG'));
      }
    }
    cb(null, true);
  }
});

const uploadFields = upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'documentos', maxCount: 5 }
]);

// POST /api/finiquito
router.post('/', uploadFields, async (req, res) => {
  try {
    const {
      nombre, rut, fechaNacimiento, direccion,
      sistemaPrevisional, afpNombre,
      cargo, fechaInicio, fechaTermino,
      horasSemanales, sueldoBase
    } = req.body;

    // Validación básica
    const camposRequeridos = { nombre, rut, fechaNacimiento, direccion, sistemaPrevisional, afpNombre, cargo, fechaInicio, fechaTermino, horasSemanales, sueldoBase };
    for (const [campo, valor] of Object.entries(camposRequeridos)) {
      if (!valor || valor.trim() === '') {
        return res.status(400).json({ error: `El campo "${campo}" es requerido` });
      }
    }

    // Cálculos de sueldo
    const bruto = parseFloat(sueldoBase);
    const afp = bruto * 0.105;
    const salud = bruto * 0.07;
    const cesantia = bruto * 0.006;
    const liquido = bruto - afp - salud - cesantia;

    const calculos = { bruto, afp, salud, cesantia, liquido };

    // Foto en base64 (si viene)
    let fotoBase64 = null;
    if (req.files?.foto?.[0]) {
      const foto = req.files.foto[0];
      fotoBase64 = `data:${foto.mimetype};base64,${foto.buffer.toString('base64')}`;
    }

    // Guardar en base de datos
    const id = db.guardarFiniquito({
      nombre, rut, fechaNacimiento, direccion,
      sistemaPrevisional, afpNombre,
      cargo, fechaInicio, fechaTermino,
      horasSemanales: parseFloat(horasSemanales),
      sueldoBase: bruto,
      ...calculos
    });

    // Generar PDF
    const pdfBuffer = await pdfGenerator.generar({
      id, nombre, rut, fechaNacimiento, direccion,
      sistemaPrevisional, afpNombre,
      cargo, fechaInicio, fechaTermino,
      horasSemanales, calculos, fotoBase64
    });

    // Responder con el PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="finiquito_${nombre.replace(/ /g, '_')}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generando finiquito:', error);
    res.status(500).json({ error: 'Error al generar el finiquito' });
  }
});

module.exports = router;