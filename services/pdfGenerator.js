const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');
const os        = require('os');

async function generar(datos) {
    const {
        id, nombre, rut, fechaNacimiento, direccion,
        sistemaPrevisional, afpNombre,
        cargo, fechaInicio, fechaTermino,
        horasSemanales, calculos, fotoBase64,
        documentos = []
    } = datos;

    const templatePath = path.join(__dirname, '../templates/finiquito.html');
    const cssPath      = path.join(__dirname, '../templates/finiquito.css');

    let html = fs.readFileSync(templatePath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');


    html = html.replace(
        '<link rel="stylesheet" href="finiquito.css">',
        `<style>${css}</style>`
    );

    const fmt = (n) => Math.round(n).toLocaleString('es-CL', {
        style: 'currency', currency: 'CLP'
    });

    const fotoHtml = fotoBase64
        ? `<img src="${fotoBase64}" alt="Foto"/>`
        : `<span class="sin-foto">Sin foto</span>`;



  let docsHtml = '';
  if (documentos.length > 0) {

      const tipoLegible = (mime) => {
          const mapa = {
              'application/pdf': 'PDF',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
              'application/msword': 'DOC',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
              'application/vnd.ms-excel': 'XLS',
              'image/jpeg': 'JPG',
              'image/png': 'PNG',
          };
          return mapa[mime] || mime.split('/')[1].toUpperCase();
      };

          const filas = documentos.map((doc, i) => `
        <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8faff'}">
            <td style="padding:6px 10px; font-size:9pt; border-bottom:1px solid #e2e8f0;">
                <span style="color:#0042AF; font-weight:600;">[${String(i + 1).padStart(2, '0')}]</span>
                &nbsp;
                <a href="http://localhost:3000/uploads/finiquito_${id}/${doc.nombreArchivo}"
                  style="color:#0042AF; text-decoration:underline;">
                    ${doc.nombre}
                </a>
            </td>
            <td style="padding:6px 10px; font-size:9pt; text-align:center; border-bottom:1px solid #e2e8f0; width:60px;">
                <span style="background:#e8effe; color:#0042AF; font-weight:700; padding:2px 7px; border-radius:3px; font-size:8pt;">
                    ${tipoLegible(doc.tipo)}
                </span>
            </td>
            <td style="padding:6px 10px; font-size:9pt; text-align:right; border-bottom:1px solid #e2e8f0; width:70px; color:#718096;">
                ${doc.tamaño}
            </td>
        </tr>
    `).join('');

      docsHtml = `
          <div class="seccion-titulo">IV. Documentos Adjuntos</div>
          <table style="width:100%; border-collapse:collapse; font-family:sans-serif;">
              <tr style="background:#0042AF;">
                  <td style="padding:7px 10px; font-size:8pt; font-weight:700; color:#FEF1D0; text-transform:uppercase; letter-spacing:1px;">
                      Nombre del Archivo
                  </td>
                  <td style="padding:7px 10px; font-size:8pt; font-weight:700; color:#FEF1D0; text-align:center; text-transform:uppercase; letter-spacing:1px; width:60px;">
                      Tipo
                  </td>
                  <td style="padding:7px 10px; font-size:8pt; font-weight:700; color:#FEF1D0; text-align:right; text-transform:uppercase; letter-spacing:1px; width:70px;">
                      Tamaño
                  </td>
              </tr>
              ${filas}
          </table>
          <p style="font-size:7.5pt; color:#718096; margin-top:5px; font-style:italic;">
              * Archivos recibidos y archivados junto a este finiquito — Folio N° ${id}. 
              Referencia de archivo: finiquito_${id}/
          </p>
      `;
  }

    html = html
        .replace(/\{\{id\}\}/g,                 id)
        .replace(/\{\{nombre\}\}/g,             nombre)
        .replace(/\{\{rut\}\}/g,                rut)
        .replace(/\{\{fechaNacimiento\}\}/g,    fechaNacimiento)
        .replace(/\{\{direccion\}\}/g,          direccion)
        .replace(/\{\{sistemaPrevisional\}\}/g, sistemaPrevisional)
        .replace(/\{\{afpNombre\}\}/g,          afpNombre)
        .replace(/\{\{cargo\}\}/g,              cargo)
        .replace(/\{\{fechaInicio\}\}/g,        fechaInicio)
        .replace(/\{\{fechaTermino\}\}/g,       fechaTermino)
        .replace(/\{\{horasSemanales\}\}/g,     horasSemanales)
        .replace(/\{\{sueldoBruto\}\}/g,        fmt(calculos.bruto))
        .replace(/\{\{descuentoAFP\}\}/g,       fmt(calculos.afp))
        .replace(/\{\{descuentoSalud\}\}/g,     fmt(calculos.salud))
        .replace(/\{\{descuentoCesantia\}\}/g,  fmt(calculos.cesantia))
        .replace(/\{\{sueldoLiquido\}\}/g,      fmt(calculos.liquido))
        .replace(/\{\{afpPorcentaje\}\}/g,      (calculos.tasaAFP * 100).toFixed(2) + '%')
        .replace(/\{\{fechaEmision\}\}/g,       new Date().toLocaleDateString('es-CL'))
        .replace(/\{\{foto\}\}/g,               fotoHtml)
        .replace(/\{\{documentosAdjuntos\}\}/g, docsHtml);

    const tmpPath = path.join(os.tmpdir(), `finiquito_${Date.now()}.html`);
    fs.writeFileSync(tmpPath, html, 'utf-8');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`file://${tmpPath}`, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    });

    await browser.close();
    fs.unlinkSync(tmpPath);

    return pdfBuffer;
}

module.exports = { generar };