module.exports = (pool) => {
  const express = require('express');
  const router = express.Router();

  // GET todos los asistencia
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM asistencia`);
      connection.release();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET asistencia por ID
  router.get('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(`SELECT * FROM asistencia WHERE id = ?`, [req.params.id]);
      connection.release();
      res.json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST crear nuevo asistencia
  router.post('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(`INSERT INTO asistencia SET ?`, req.body);
      connection.release();
      res.json({ id: result.insertId, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT actualizar asistencia
  router.put('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query(`UPDATE asistencia SET ? WHERE id = ?`, [req.body, req.params.id]);
      connection.release();
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE asistencia
  router.delete('/:id', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query(`DELETE FROM asistencia WHERE id = ?`, [req.params.id]);
      connection.release();
      res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // NUEVO: Endpoint para demostrar comunicación inter-servicios (MS1 -> MS3)
  router.get('/extra/resumen-completo', async (req, res) => {
    try {
      const axios = require('axios');
      const targetUrl = process.env.AYALA_EMPLEADOS_URL || 'http://ayala-empleados:3019';
      // Llamada interna de Docker a ms-empleados (Petición de Microservicio a Microservicio)
      const response = await axios.get(`${targetUrl}/api/empleados`);
      
      const connection = await pool.getConnection();
      const [asistencias] = await connection.query(`SELECT * FROM asistencia LIMIT 5`);
      connection.release();

      res.json({
        message: "Resumen generado combinando Microservicio Asistencia + Microservicio Empleados",
        total_empleados: response.data.length,
        una_muestra_empleados: response.data[0] || "Sin datos",
        algunas_asistencias: asistencias
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Error en comunicación inter-servicios", 
        details: error.message,
        hint: "Asegúrate de que 'ayala-empleados' esté corriendo en Docker"
      });
    }
  });

  return router;
};
