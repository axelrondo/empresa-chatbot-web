import express from 'express';
import { askGemini } from '../services/aiService.js';

const router = express.Router();

// Escuchar directamente en la raíz '/' para coincidir con /api/chat
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const reply = await askGemini(message);
    res.json({ reply });
  } catch (error) {
    console.error('❌ Error interno en la ruta de chat:', error);
    res.status(500).json({ reply: '¡Hola! Disculpa la demora, ¿en qué servicio de limpieza puedo ayudarte hoy?' });
  }
});

export default router;