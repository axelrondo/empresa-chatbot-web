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

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// SIRVE ARCHIVOS ESTÁTICOS
// ==========================================
app.use(express.static(path.join(__dirname, '../public')));

// ==========================================
// RUTAS DE LA API
// ==========================================
app.use('/api/chat', chatRoutes);

// ==========================================
// ENDPOINT DE VERIFICACIÓN DE ESTADO
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor Backend de LIM-BOLIVIA operando correctamente',
    timestamp: new Date()
  });
});

// ==========================================
// CAPTURA PARA CUALQUIER OTRA RUTA
// ==========================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ==========================================
// ✅ INICIAR SERVIDOR CON MANEJO DE ERRORES
// ==========================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../public')}`);
  console.log(`🌐 URL local: http://localhost:${PORT}`);
  console.log(`=================================`);
});

// ✅ MANEJAR ERROR DE PUERTO EN USO
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está en uso.`);
    console.log(`🔄 Intentando usar el puerto ${PORT + 1}...`);
    
    // Intentar con el siguiente puerto
    const newPort = PORT + 1;
    const newServer = app.listen(newPort, '0.0.0.0', () => {
      console.log(`=================================`);
      console.log(`🚀 Servidor ejecutándose en el puerto ${newPort}`);
      console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../public')}`);
      console.log(`🌐 URL local: http://localhost:${newPort}`);
      console.log(`=================================`);
    });
    
    newServer.on('error', (err2) => {
      console.error(`❌ Error también en el puerto ${newPort}:`, err2);
      process.exit(1);
    });
  } else {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
});