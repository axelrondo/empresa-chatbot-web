import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
app.use('/api/chat', chatRoutes);

// Endpoint de verificación de estado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor Backend de LIM-BOLIVIA operando correctamente',
    timestamp: new Date()
  });
});

// Captura para cualquier otra ruta web (sirve el index.html del frontend)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Iniciar servidor binding en 0.0.0.0 para compatibilidad total en Hosting
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`=================================`);
});

// server/index.js - Línea final
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../public')}`);
  console.log(`🌐 URL local: http://localhost:${PORT}`);
  console.log(`=================================`);
});