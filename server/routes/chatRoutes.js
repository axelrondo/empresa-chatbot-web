import express from 'express';
import { askGemini } from '../services/aiService.js';

const router = express.Router();

router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const reply = await askGemini(message);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al procesar la respuesta.' });
  }
});

export default router;