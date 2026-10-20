import express from 'express';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const router = express.Router();

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
        .replace(/\+?\s*591\s*730\s*17175/g, 'setenta y tres, cero diez y siete, diez y siete cinco')
        .replace(/73017175/g, 'setenta y tres, cero diez y siete, diez y siete cinco')
        .replace(/&/g, ' y ')
        .replace(/%/g, ' por ciento ')
        .replace(/\//g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// ==========================================
// ENDPOINT: POST /api/tts (Microsoft Edge TTS)
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

        console.log('🎙️ Edge TTS: Generando audio...');
        console.log('📝 Texto:', textoLimpio.substring(0, 100) + '...');

        // 🎤 VOZ: cambia aquí si quieres otra voz
        const VOZ = 'es-MX-DaliaNeural';  // 🇧🇴 Boliviano masculino

        const tts = new MsEdgeTTS();
        await tts.setMetadata(VOZ, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        const { audioStream } = await tts.toStream(textoLimpio);

        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        console.log('✅ Edge TTS: Audio generado (' + buffer.length + ' bytes)');

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'no-cache'
        });
        res.send(buffer);

    } catch (error) {
        console.error('❌ ERROR EN TTS:');
        console.error('Mensaje:', error?.message);

        res.status(500).json({
            error: 'Error al generar audio',
            fallback: true
        });
    }
});

export default router;