const express      = require('express');
const router       = express.Router();
const multer       = require('multer');
const path         = require('path');
const fs           = require('fs');
const pdfGenerator = require('../services/pdfGenerator');
const db           = require('../database/db');

const storage = multer.memoryStorage();
const upload  = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
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
    { name: 'foto',       maxCount: 1 },
    { name: 'documentos', maxCount: 5 }
]);

router.post('/', uploadFields, async (req, res) => {
    try {
        const {
            nombre, rut, fechaNacimiento, direccion,
            sistemaPrevisional, afpNombre,
            cargo, fechaInicio, fechaTermino,
            horasSemanales, sueldoBase, afpTasa
        } = req.body;


        const camposRequeridos = {
            nombre, rut, fechaNacimiento, direccion,
            sistemaPrevisional, cargo, fechaInicio,
            fechaTermino, horasSemanales, sueldoBase
        };
        for (const [campo, valor] of Object.entries(camposRequeridos)) {
            if (!valor || valor.toString().trim() === '') {
                return res.status(400).json({ error: `El campo "${campo}" es requerido` });
            }
        }


        const bruto    = parseFloat(sueldoBase);
        const tasaAFP  = parseFloat(afpTasa) || 0.105;
        const afp      = bruto * tasaAFP;
        const salud    = bruto * 0.07;
        const cesantia = bruto * 0.006;
        const liquido  = bruto - afp - salud - cesantia;
        const calculos = { bruto, afp, salud, cesantia, liquido, tasaAFP };


        let fotoBase64 = null;
        if (req.files?.foto?.[0]) {
            const foto = req.files.foto[0];
            fotoBase64 = `data:${foto.mimetype};base64,${foto.buffer.toString('base64')}`;
        }


        const id = db.guardarFiniquito({
            nombre, rut, fechaNacimiento, direccion,
            sistemaPrevisional, afpNombre: afpNombre || 'N/A',
            cargo, fechaInicio, fechaTermino,
            horasSemanales: parseFloat(horasSemanales),
            sueldoBase: bruto,
            ...calculos
        });


        const documentosGuardados = [];
        if (req.files?.documentos?.length > 0) {
            const carpeta = path.join(__dirname, '../uploads', `finiquito_${id}`);
            fs.mkdirSync(carpeta, { recursive: true });

            for (const doc of req.files.documentos) {
                const nombreArchivo = `${Date.now()}_${doc.originalname}`;
                const rutaArchivo   = path.join(carpeta, nombreArchivo);
                fs.writeFileSync(rutaArchivo, doc.buffer);
                documentosGuardados.push({
                    nombre:        doc.originalname,
                    nombreArchivo: nombreArchivo,
                    tamaño:        (doc.size / 1024).toFixed(1) + ' KB',
                    tipo:          doc.mimetype,
                    fecha:         new Date().toLocaleDateString('es-CL')
                });
            }
        }


        const pdfBuffer = await pdfGenerator.generar({
            id, nombre, rut, fechaNacimiento, direccion,
            sistemaPrevisional, afpNombre: afpNombre || 'N/A',
            cargo, fechaInicio, fechaTermino,
            horasSemanales, calculos, fotoBase64,
            documentos: documentosGuardados
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="finiquito_${nombre.replace(/ /g, '_')}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generando finiquito:', error);
        res.status(500).json({ error: 'Error al generar el finiquito' });
    }
});

module.exports = router;