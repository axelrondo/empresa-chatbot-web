import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askGemini(userQuery, chatHistory = []) {
    console.log('📨 askGemini llamado');
    console.log('📝 Mensaje:', userQuery);
    console.log('📚 Historial:', chatHistory?.length || 0);
    console.log('🔑 API Key configurada:', process.env.GROQ_API_KEY ? '✅ SI' : '❌ NO');

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
            infoEmpresa = 'Lim Bolivia: Empresa de limpieza profesional en La Paz y El Alto, Bolivia. WhatsApp: 71506930.';
        }

        const systemPrompt = `${infoEmpresa}

REGLAS DE MEMORIA Y ATENCIÓN:
- Mantén SIEMPRE la continuidad de la conversación y el contexto de las cotizaciones previas.
- Si el usuario responde con datos adicionales, NO los saludes de nuevo como un chat nuevo.
- Usa los datos del historial y da la cotización final acumulada de inmediato.
- Solo ofrece WhatsApp si el usuario pide agendar o confirmar el servicio.`;

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

        // 5. Últimos 8 mensajes
        const recentHistory = cleanHistory.slice(-8);

        // 6. Construir mensajes
        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: userQuery.trim() }
        ];

        console.log('📤 Modelo: llama-3.1-8b-instant');
        console.log('📤 Mensajes:', JSON.stringify(messages, null, 2));

        // 7. ✅ LLAMADA CORRECTA A GROQ CON MODELO DISPONIBLE
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.1-8b-instant',  // ← Modelo que SÍ está disponible
            temperature: 0.4,
            max_tokens: 500
        });

        const response = chatCompletion.choices[0]?.message?.content;
        console.log('✅ Respuesta de Groq:', response?.substring(0, 100));

        return response || '¡Hola! ¿En qué puedo ayudarte hoy?';

    } catch (error) {
        console.error('❌ ERROR EN askGemini:');
        console.error('Mensaje:', error?.message);
        console.error('Stack:', error?.stack);

        // 🔴 Mensajes de error específicos
        if (error?.message?.includes('API key')) {
            return "❌ Error de configuración: La API Key no es válida. Contacta al administrador.";
        } else if (error?.message?.includes('model')) {
            return `❌ Error: El modelo 'llama-3.1-8b-instant' no está disponible. Contacta al administrador.`;
        } else if (error?.message?.includes('rate limit')) {
            return "⏳ Demasiadas solicitudes. Espera un momento e intenta nuevamente.";
        } else if (error?.message?.includes('timeout')) {
            return "⏱️ El servidor está tardando en responder. Intenta nuevamente.";
        } else {
            return "¡Hola! Tuve un inconveniente momentáneo. ¿Podrías indicarme nuevamente qué servicio deseas cotizar?";
        }
    }
}