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
  database: process.env.DB_NAME || 'ayala-asistencia_empleados',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'empleados', port: 3021 });
});

// API Routes
app.use('/api/empleados', require('./routes/empleados.js')(pool));

const PORT = process.env.PORT || 3021;
app.listen(PORT, () => {
  console.log(`empleados microservice running on port ${PORT}`);
});
