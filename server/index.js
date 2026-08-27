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
// ✅ INICIAR SERVIDOR - UNA SOLA VEZ
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../public')}`);
  console.log(`🌐 URL local: http://localhost:${PORT}`);
  console.log(`=================================`);
});