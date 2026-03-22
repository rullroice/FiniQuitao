const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');

async function generar(datos) {
  const {
    id, nombre, rut, fechaNacimiento, direccion,
    sistemaPrevisional, afpNombre,
    cargo, fechaInicio, fechaTermino,
    horasSemanales, calculos, fotoBase64
  } = datos;

  // Leer la plantilla HTML
  const templatePath = path.join(__dirname, '../templates/finiquito.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Formatear números como pesos chilenos
  const fmt = (n) => Math.round(n).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
  });

  // Reemplazar variables en la plantilla
  html = html
    .replace('{{id}}',                 id)
    .replace('{{nombre}}',             nombre)
    .replace('{{rut}}',                rut)
    .replace('{{fechaNacimiento}}',    fechaNacimiento)
    .replace('{{direccion}}',          direccion)
    .replace('{{sistemaPrevisional}}', sistemaPrevisional)
    .replace('{{afpNombre}}',          afpNombre)
    .replace('{{cargo}}',              cargo)
    .replace('{{fechaInicio}}',        fechaInicio)
    .replace('{{fechaTermino}}',       fechaTermino)
    .replace('{{horasSemanales}}',     horasSemanales)
    .replace('{{sueldoBruto}}',        fmt(calculos.bruto))
    .replace('{{descuentoAFP}}',       fmt(calculos.afp))
    .replace('{{descuentoSalud}}',     fmt(calculos.salud))
    .replace('{{descuentoCesantia}}',  fmt(calculos.cesantia))
    .replace('{{sueldoLiquido}}',      fmt(calculos.liquido))
    .replace('{{fechaEmision}}',       new Date().toLocaleDateString('es-CL'))
    .replace('{{foto}}',               fotoBase64
      ? `<img src="${fotoBase64}" alt="Foto trabajador"/>`
      : '<div class="sin-foto">Sin foto</div>'
    );

  // Guardar HTML procesado en archivo temporal
  const tmpPath = path.join(os.tmpdir(), `finiquito_${Date.now()}.html`);
  fs.writeFileSync(tmpPath, html, 'utf-8');

  // Lanzar Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Navegar al archivo temporal (así resuelve el CSS externo)
  await page.goto(`file://${tmpPath}`, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm'
    }
  });

  await browser.close();

  // Eliminar archivo temporal
  fs.unlinkSync(tmpPath);

  return pdfBuffer;
}

module.exports = { generar };