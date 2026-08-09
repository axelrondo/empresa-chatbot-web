import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askGemini(userQuery, chatHistory = []) {
  try {
    // 1. Carga del archivo de información
    let infoEmpresa = '';
    const txtPath = path.join(__dirname, '../data/informacion.txt');

    if (fs.existsSync(txtPath)) {
      infoEmpresa = fs.readFileSync(txtPath, 'utf-8');
    } else {
      infoEmpresa = 'Lim Bolivia: Empresa de limpieza profesional en La Paz y El Alto, Bolivia. WhatsApp: 71506930.';
    }

    const systemPrompt = `${infoEmpresa}

REGLAS DE MEMORIA Y ATENCIÓN:
- Mantén SIEMPRE la continuidad de la conversación y el contexto de las cotizaciones previas.
- Si el usuario responde con datos adicionales (ej: "ambas caras", "4 sillas", "sí"), NO los saludes de nuevo como un chat nuevo. Usa los datos del historial y da la cotización final acumulada de inmediato.
- Solo ofrece WhatsApp si el usuario pide agendar o confirmar el servicio.`;

    // 2. Normalización de historial a formatos válidos para Groq (user / assistant)
    const formattedHistory = [];

    chatHistory.forEach(msg => {
      let role = msg.role;
      if (role === 'model' || role === 'bot') role = 'assistant';
      if (role !== 'user' && role !== 'assistant') role = 'user';

      let textContent = '';
      if (typeof msg.content === 'string') textContent = msg.content;
      else if (msg.parts && Array.isArray(msg.parts) && msg.parts[0]?.text) textContent = msg.parts[0].text;
      else if (typeof msg.text === 'string') textContent = msg.text;

      if (textContent.trim() !== '') {
        formattedHistory.push({
          role: role,
          content: textContent.trim()
        });
      }
    });

    // 3. Filtrar roles duplicados consecutivos para evitar errores 400
    const cleanHistory = [];
    formattedHistory.forEach(msg => {
      if (cleanHistory.length === 0) {
        cleanHistory.push(msg);
      } else {
        const lastMsg = cleanHistory[cleanHistory.length - 1];
        // Evita agregar el mismo mensaje del usuario al final si ya venía en el historial
        if (lastMsg.role !== msg.role || lastMsg.content !== msg.content) {
          cleanHistory.push(msg);
        }
      }
    });

    // 4. Asegurar que el último mensaje no esté duplicado con userQuery
    if (cleanHistory.length > 0) {
      const last = cleanHistory[cleanHistory.length - 1];
      if (last.role === 'user' && last.content === userQuery.trim()) {
        cleanHistory.pop();
      }
    }

    // 5. Ensamblado del payload
    const messages = [
      { role: 'system', content: systemPrompt },
      ...cleanHistory,
      { role: 'user', content: userQuery.trim() }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4
    });

    return chatCompletion.choices[0]?.message?.content || '¡Hola! ¿En qué puedo ayudarte hoy?';

  } catch (error) {
    console.error('❌ DETALLE DEL ERROR EN GROQ/AI-SERVICE:', error?.message || error);
    return "¡Hola! Tuve un inconveniente momentáneo. ¿Podrías indicarme nuevamente qué servicio deseas cotizar?";
  }
}