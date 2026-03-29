const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ayala-asistencia_asistencia',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auth Middleware
const verifyToken = require('./middlewares/authMiddleware');

// Health check (Public)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'asistencia', port: 3024 });
});

// API Routes (Protected)
app.use('/api/asistencia', verifyToken, require('./routes/asistencia.js')(pool));

const PORT = process.env.PORT || 3024;
app.listen(PORT, () => {
  console.log(`asistencia microservice running on port ${PORT}`);
});
