import express from 'express';
import { askGemini } from '../services/aiService.js';

const router = express.Router();

// Escuchar en '/' para atender las peticiones de POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    // Aseguramos que history sea un arreglo aunque no venga en el body
    const chatHistory = Array.isArray(history) ? history : [];

    // Pasamos tanto el mensaje actual como el historial acumulado
    const reply = await askGemini(message, chatHistory);

    res.json({ reply });
  } catch (error) {
    console.error('❌ Error interno en la ruta de chat:', error);
    res.status(500).json({ reply: '¡Hola! Disculpa la demora, ¿en qué servicio de limpieza de Lim Bolivia puedo ayudarte hoy?' });
  }
});

export default router;