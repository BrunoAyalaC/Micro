const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3201;

app.use(cors());
app.use(express.json());

// Configuración de conexión MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: 'ayala_clientes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware de validación
const validarCliente = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('estado').optional().isIn(['activo', 'inactivo', 'suspendido'])
];

// Auth Middleware
const verifyToken = require('./middlewares/authMiddleware');

// Health check (Public)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'clientes', port: PORT });
});

// API Routes (Protected)
app.use('/api/clientes', verifyToken, require('./routes/clientes.js')(pool));

app.listen(PORT, () => {
  console.log(`✓ Microservicio de Clientes ejecutándose en puerto ${PORT}`);
});
