import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODELO = 'openai/gpt-oss-120b';

// ==========================================
// FUNCIÓN PARA CORREGIR ENLACES DE WHATSAPP
// ==========================================
function corregirEnlacesWhatsApp(texto) {
    if (!texto) return texto;
    const waLinkRegex = /https:\/\/wa\.me\/(\d+)\?text=([^\s"')]+)/g;
    return texto.replace(waLinkRegex, (match, numero, textoEnlace) => {
        let textoDecodificado;
        try {
            textoDecodificado = decodeURIComponent(textoEnlace);
        } catch (e) {
            textoDecodificado = textoEnlace;
        }
        textoDecodificado = textoDecodificado
            .replace(/\s+/g, ' ')
            .replace(/[\r\n]+/g, ' ')
            .replace(/%/g, ' por ciento')
            .replace(/&/g, ' y ')
            .trim();
        const textoCodificado = encodeURIComponent(textoDecodificado);
        return `https://wa.me/${numero}?text=${textoCodificado}`;
    });
}

export async function askGemini(userQuery, chatHistory = []) {
    console.log('📨 askGemini llamado');
    console.log('📝 Mensaje:', userQuery);
    console.log('📚 Historial:', chatHistory?.length || 0);
    console.log('🔑 API Key configurada:', process.env.GROQ_API_KEY ? '✅ SI' : '❌ NO');
    console.log('📤 Modelo a usar:', MODELO);

    try {
        // 1. Cargar archivo de información
        let infoEmpresa = '';
        const txtPath = path.join(__dirname, '../data/informacion.txt');
        console.log('📁 Ruta archivo:', txtPath);

        if (fs.existsSync(txtPath)) {
            infoEmpresa = fs.readFileSync(txtPath, 'utf-8');
            console.log('✅ Archivo cargado correctamente');
        } else {
            console.warn('⚠️ Archivo no encontrado, usando texto por defecto');
            infoEmpresa = 'Lim Bolivia: Empresa de limpieza profesional en La Paz y El Alto, Bolivia. WhatsApp: 73017175.';
        }

        // ==========================================
        // 🔥 PROMPT CORREGIDO (SIN CONTRADICCIONES)
        // ==========================================
        const systemPrompt = `${infoEmpresa}

REGLAS DE MEMORIA Y ATENCIÓN:
- Mantén SIEMPRE la continuidad de la conversación y el contexto de las cotizaciones previas.
- Si el usuario responde con datos adicionales, NO los saludes de nuevo como un chat nuevo.
- Usa los datos del historial y da la cotización final acumulada de inmediato.
- El archivo de instrucciones de arriba contiene TODAS las reglas sobre el enlace de WhatsApp. Síguelas al pie de la letra.`;

        // 2. Formatear historial
        const formattedHistory = (chatHistory || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        // 3. Limpiar roles duplicados
        const cleanHistory = [];
        formattedHistory.forEach(msg => {
            if (cleanHistory.length === 0) {
                cleanHistory.push(msg);
            } else {
                const last = cleanHistory[cleanHistory.length - 1];
                if (last.role !== msg.role || last.content !== msg.content) {
                    cleanHistory.push(msg);
                }
            }
        });

        // 4. Asegurar que el último mensaje no esté duplicado
        if (cleanHistory.length > 0) {
            const last = cleanHistory[cleanHistory.length - 1];
            if (last.role === 'user' && last.content === userQuery.trim()) {
                cleanHistory.pop();
            }
        }

        // 5. Últimos 10 mensajes (subí de 8 a 10 para más contexto)
        const recentHistory = cleanHistory.slice(-10);

        // 6. Construir mensajes
        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: userQuery.trim() }
        ];

        console.log('📤 Enviando a Groq con modelo:', MODELO);

        // 7. LLAMADA A GROQ (con parámetros mejorados)
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: MODELO,
            temperature: 0.3,        // ← Bajé de 0.4 a 0.3 (más determinista)
            max_tokens: 800,         // ← Subí de 500 a 800 (respuestas completas)
            top_p: 0.9,              // ← Bajé de 1 a 0.9 (más enfocado)
            presence_penalty: 0.3,   // ← NUEVO: evita repetir el saludo
            frequency_penalty: 0.2,  // ← NUEVO: evita repetir frases
            stream: false
        });

        let response = chatCompletion.choices[0]?.message?.content;
        console.log('✅ Respuesta original:', response?.substring(0, 200));

        // ==========================================
        // 🔥 CORREGIR ENLACES DE WHATSAPP
        // ==========================================
        if (response) {
            response = corregirEnlacesWhatsApp(response);
            console.log('✅ Respuesta corregida:', response?.substring(0, 300));
        }

        return response || '¡Hola! ¿En qué puedo ayudarte hoy?';

    } catch (error) {
        console.error('❌ ERROR EN askGemini:');
        console.error('Mensaje:', error?.message);
        console.error('Stack:', error?.stack);

        if (error?.message?.includes('API key')) {
            return "❌ Error: La API Key no es válida. Contacta al administrador.";
        } else if (error?.message?.includes('model')) {
            return `❌ Error: El modelo '${MODELO}' no está disponible. Contacta al administrador.`;
        } else if (error?.message?.includes('rate limit')) {
            return "⏳ Demasiadas solicitudes. Espera un momento e intenta nuevamente.";
        } else if (error?.message?.includes('timeout')) {
            return "⏱️ El servidor está tardando en responder. Intenta nuevamente.";
        } else {
            return "¡Hola! Tuve un inconveniente momentáneo. ¿Podrías indicarme nuevamente qué servicio deseas cotizar?";
        }
    }
}