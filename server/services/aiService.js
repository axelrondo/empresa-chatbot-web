import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar cliente fuera de la función
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askGemini(userQuery, chatHistory = []) {
  try {
    // 1. Carga del archivo de información
    let infoEmpresa = '';
    const possiblePaths = [
      path.join(__dirname, '../data/informacion.txt'),
      path.join(__dirname, '../data/informacion..txt'),
      path.join(__dirname, '../data/informacion..txt.txt')
    ];

    for (const txtPath of possiblePaths) {
      if (fs.existsSync(txtPath)) {
        infoEmpresa = fs.readFileSync(txtPath, 'utf-8');
        break;
      }
    }

    if (!infoEmpresa) {
      infoEmpresa = 'Lim Bolivia: Empresa de limpieza profesional en La Paz y El Alto, Bolivia. WhatsApp: 71506930.';
    }

    // Prompt del sistema para forzar memoria de cotizaciones
    const systemPrompt = `${infoEmpresa}

REGLAS DE MEMORIA Y ATENCIÓN:
- Mantén SIEMPRE la continuidad de la conversación y el contexto de las cotizaciones previas.
- Si el usuario responde con datos adicionales (ej: "ambas caras", "4 sillas", "sí"), NO los saludes de nuevo como un chat nuevo. Usa los datos del historial y da la cotización final acumulada de inmediato.
- Solo ofrece WhatsApp si el usuario pide agendar o confirmar el servicio.`;

    // 2. Mapeo ultra-seguro del historial para Groq (evita strings vacíos)
    const formattedHistory = chatHistory
      .map(msg => {
        let contentText = '';
        
        if (typeof msg.content === 'string') contentText = msg.content;
        else if (msg.parts && Array.isArray(msg.parts) && msg.parts[0]?.text) contentText = msg.parts[0].text;
        else if (typeof msg.text === 'string') contentText = msg.text;

        return {
          role: (msg.role === 'model' || msg.role === 'bot') ? 'assistant' : 'user',
          content: contentText.trim()
        };
      })
      .filter(msg => msg.content !== ''); // Elimina mensajes sin texto que rompen la API

    // 3. Ensamblado de la conversación
    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: userQuery.trim() }
    ];

    // 4. Consulta a Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4
    });

    return chatCompletion.choices[0]?.message?.content || '¡Hola! ¿En qué puedo ayudarte hoy?';

  } catch (error) {
    // ESTO TE MOSTRARÁ EL ERROR REAL EN RENDER / TERMINAL
    console.error('❌ DETALLE DEL ERROR EN GROQ/AI-SERVICE:', error);
    return "¡Hola! Tuve un inconveniente momentáneo. ¿Podrías indicarme nuevamente qué servicio deseas cotizar?";
  }
}