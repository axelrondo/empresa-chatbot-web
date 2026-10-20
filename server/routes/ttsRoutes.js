import express from 'express';
import { Communicate } from 'edge-tts-universal';

const router = express.Router();

// ... (tu función limpiarTextoParaTTS se queda igual) ...

router.post('/', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') return res.status(400).json({ error: 'Texto vacío' });

        let textoLimpio = limpiarTextoParaTTS(text);
        if (!textoLimpio) return res.status(400).json({ error: 'Texto vacío después de limpiar' });
        if (textoLimpio.length > 5000) textoLimpio = textoLimpio.substring(0, 5000);

        console.log('🎙️ Edge TTS: Generando audio...');

        const VOZ = 'es-MX-DaliaNeural';

        // ✅ Usar la API de Streaming (Communicate) en lugar de EdgeTTS
        const communicate = new Communicate(textoLimpio, {
            voice: VOZ,
        });

        const buffers = [];
        for await (const chunk of communicate.stream()) {
            if (chunk.type === 'audio' && chunk.data) {
                buffers.push(chunk.data);
            }
        }

        // Concatenar todos los trozos de audio en un solo Buffer
        const buffer = Buffer.concat(buffers);

        if (buffer.length === 0) {
            throw new Error('No se recibió audio del servicio de Microsoft.');
        }

        console.log('✅ Edge TTS: Audio generado (' + buffer.length + ' bytes)');

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'no-cache'
        });
        res.send(buffer);

    } catch (error) {
        console.error('❌ ERROR EN TTS:', error?.message);
        res.status(500).json({ error: 'Error al generar audio', fallback: true });
    }
});

export default router;