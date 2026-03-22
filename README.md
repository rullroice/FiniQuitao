# 📄 FiniQuitao

Generador de finiquitos laborales en PDF, desarrollado como actividad acumulativa para el ramo de Desarrollo Web.

Permite ingresar los datos de un trabajador y genera automáticamente un documento de finiquito oficial en PDF, con cálculo de sueldo bruto y líquido según la legislación laboral chilena (Art. 177 del Código del Trabajo).

---

## 🚀 Cómo probar el proyecto

### 1. Clona el repositorio

```bash
git clone https://github.com/rullroice/FiniQuitao.git
cd FiniQuitao
```

### 2. Instala las dependencias

```bash
npm install
```

> ⚠️ Puppeteer descarga Chromium (~170MB) al instalarse. Es normal, espera que termine.

### 3. Inicia el servidor

```bash
node server.js
```

### 4. Abre el navegador

```
http://localhost:3000
```

Completa el formulario y haz clic en **Generar Finiquito PDF**. El archivo se descargará automáticamente.

---

## 🧱 Stack tecnológica

| Capa | Tecnología |
|---|---|
| Frontend | HTML + CSS + JavaScript |
| Backend | Node.js + Express |
| Generación PDF | Puppeteer |
| Archivos adjuntos | Multer |
| Base de datos | SQLite (better-sqlite3) |

---

## 📁 Estructura del proyecto

```
FiniQuitao/
│
├── server.js                 # Entry point — Express
├── package.json
│
├── routes/
│   └── finiquito.js          # POST /api/finiquito
│
├── services/
│   └── pdfGenerator.js       # Lógica de Puppeteer
│
├── templates/
│   ├── finiquito.html         # Plantilla visual del PDF
│   └── finiquito.css          # Estilos del PDF
│
├── database/
│   └── db.js                  # Conexión SQLite
│
└── public/
    ├── index.html             # Formulario principal
    ├── style.css              # Estilos del frontend
    └── app.js                 # Lógica del cliente
```

---

## ⚙️ Funcionalidades

- ✅ Datos personales del trabajador (nombre, RUT, dirección, sistema previsional)
- ✅ Cargo específico y fechas de contrato
- ✅ Horas semanales y cálculo automático de sueldo
- ✅ Descuentos legales: AFP (10.5%), Salud (7%), Seguro Cesantía (0.6%)
- ✅ Generación de PDF con diseño formal
- ✅ Persistencia en base de datos SQLite
- ⭐ Foto del trabajador incrustada en el PDF *(puntos extra)*
- ⭐ Documentos adjuntos *(puntos extra)*

---

## 🧮 Fórmula de cálculo

```
Sueldo Bruto
  − AFP            (10.5%)
  − Salud          (7.0%)
  − Seg. Cesantía  (0.6%)
─────────────────────────
= Sueldo Líquido
```

---

## 👥 Equipo

| Rol | Responsable |
|---|---|
| Backend + Base de datos | Raúl Ibarra Urizar |
| Frontend + Diseño | Jhon Jairo Bustos |

---

## 📚 Documentación

- [🎨 Guía de diseño para el Frontend]([guia-frontend-1.pdf](https://github.com/user-attachments/files/26169182/guia-frontend-1.pdf)


---

## 📦 Dependencias

```json
{
  "express": "^4.18.2",
  "puppeteer": "^21.0.0",
  "multer": "^1.4.5",
  "better-sqlite3": "^9.0.0"
}
```
