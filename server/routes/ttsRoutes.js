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
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/`/g, '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        .replace(/LIM-BOLIVIA/gi, 'Lim Bolivia')
        .replace(/Lim-Bolivia/gi, 'Lim Bolivia')
        .replace(/\+?\s*591\s*730\s*17175/g, 'setenta y tres cero diez y siete diez y siete cinco')
        .replace(/73017175/g, 'setenta y tres cero diez y siete diez y siete cinco')
        .replace(/&/g, ' y ')
        .replace(/%/g, ' por ciento ')
        .replace(/\//g, ' ')
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

        let textoLimpio = limpiarTextoParaTTS(text);

        if (!textoLimpio) {
            return res.status(400).json({ error: 'Texto vacío después de limpiar.' });
        }

        if (textoLimpio.length > 5000) {
            textoLimpio = textoLimpio.substring(0, 5000);
        }

        console.log('🎙️ TTS: Generando audio...');
        console.log('📝 Texto:', textoLimpio.substring(0, 100) + '...');

        // ✅ LLAMADA CORREGIDA A GROQ TTS
        const response = await groq.audio.speech.create({
            model: 'canopylabs/orpheus-v1-english',  // 🔥 MODELO VIGENTE
            voice: 'tara',                            // 🔥 VOZ VIGENTE
            input: textoLimpio,
            response_format: 'mp3'
        });

        const buffer = Buffer.from(await response.arrayBuffer());

        console.log('✅ TTS: Audio generado (' + buffer.length + ' bytes)');

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'no-cache'
        });
        res.send(buffer);

    } catch (error) {
        console.error('❌ ERROR EN TTS:');
        console.error('Mensaje:', error?.message);

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