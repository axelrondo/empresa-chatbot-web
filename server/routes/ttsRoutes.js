import express from 'express';
import Groq from 'groq-sdk';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ==========================================
// LIMPIAR TEXTO PARA TTS
// ==========================================
function limpiarTextoParaTTS(texto) {
    if (!texto) return '';

    return texto
        // Quitar URLs
        .replace(/https?:\/\/[^\s]+/g, '')
        // Quitar markdown
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/`/g, '')
        // Quitar HTML
        .replace(/<[^>]*>?/gm, '')
        // Quitar emojis
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        // Pronunciación correcta
        .replace(/LIM-BOLIVIA/gi, 'Lim Bolivia')
        .replace(/Lim-Bolivia/gi, 'Lim Bolivia')
        // Números de teléfono
        .replace(/\+?\s*591\s*730\s*17175/g, 'setenta y tres cero diez y siete diez y siete cinco')
        .replace(/73017175/g, 'setenta y tres cero diez y siete diez y siete cinco')
        // Símbolos
        .replace(/&/g, ' y ')
        .replace(/%/g, ' por ciento ')
        .replace(/\//g, ' ')
        // Espacios múltiples
        .replace(/\s+/g, ' ')
        .trim();
}

// ==========================================
// ENDPOINT: POST /api/tts
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'El texto no puede estar vacío.' });
        }

        // Limpiar texto
        let textoLimpio = limpiarTextoParaTTS(text);

        if (!textoLimpio) {
            return res.status(400).json({ error: 'Texto vacío después de limpiar.' });
        }

        // Limitar longitud (Groq permite hasta ~10,000 chars)
        if (textoLimpio.length > 5000) {
            textoLimpio = textoLimpio.substring(0, 5000);
        }

        console.log('🎙️ TTS: Generando audio...');
        console.log('📝 Texto:', textoLimpio.substring(0, 100) + '...');

        // Llamar a Groq TTS
        const response = await groq.audio.speech.create({
            model: 'playai-tts',
            voice: 'Fritz-PlayAI',  // Opciones: Fritz-PlayAI, Indira-PlayAI, Celeste-PlayAI
            input: textoLimpio,
            response_format: 'mp3'
        });

        // Convertir a buffer
        const buffer = Buffer.from(await response.arrayBuffer());

        console.log('✅ TTS: Audio generado (' + buffer.length + ' bytes)');

        // Devolver el audio
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'no-cache'
        });
        res.send(buffer);

    } catch (error) {
        console.error('❌ ERROR EN TTS:');
        console.error('Mensaje:', error?.message);

        // Códigos de error específicos
        if (error?.message?.includes('rate limit') || error?.message?.includes('quota')) {
            return res.status(429).json({
                error: 'Límite alcanzado',
                fallback: true
            });
        }

        res.status(500).json({
            error: 'Error al generar audio',
            fallback: true
        });
    }
});

export default router;