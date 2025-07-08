// ==============================
// 📦 IMPORTACIONES
// ==============================

import express from 'express';
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import cors from 'cors';
import multer from 'multer';

import indexRoutes from './routes/rutas.js';

// ==============================
// 📌 CONFIGURACIONES INICIALES
// ==============================

const app = express();
const { Pool } = pkg;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==============================
// 🗄️ CONEXIÓN A BASE DE DATOS
// ==============================

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cec',
  password: '0000',
  port: 5432,
});

pool.query('SELECT NOW()')
  .then(res => console.log('PostgreSQL conectado:', res.rows[0]))
  .catch(err => console.error('Error conexión PostgreSQL:', err));

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// ==============================
// 📤 CONFIGURACIÓN DE MULTER
// ==============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, 'public/uploads')); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

export const upload = multer({ storage });

// ==============================
// 🌍 CONFIGURACIONES DE LA APP
// ==============================

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(join(__dirname, 'public')));

// ==============================
// 🧭 RUTAS
// ==============================

app.use(indexRoutes); 

// ==============================
// 🚀 INICIO DEL SERVIDOR
// ==============================

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
