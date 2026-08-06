import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function askGemini(userQuery) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Leer el archivo .txt de forma segura y liviana
    let infoEmpresa = '';
    const txtPath = path.join(__dirname, '../data/informacion.txt');

    if (fs.existsSync(txtPath)) {
      infoEmpresa = fs.readFileSync(txtPath, 'utf-8');
    } else {
      infoEmpresa = 'LIM-BOLIVIA: Empresa de limpieza profesional en La Paz, Bolivia. WhatsApp: 71506930.';
    }

    const systemInstruction = `
Eres el asistente virtual amable, atento y carismático de LIM-BOLIVIA.

INFORMACIÓN DE LA EMPRESA:
${infoEmpresa}

REGLAS DE CONDUCTA:
1. Saluda con buena actitud y mantén una conversación fluida y natural.
2. Usa la información brindada para orientar al cliente sobre precios y servicios.
3. Sugiere usar el cotizador web que está en la pantalla si el usuario desea un monto según sus metros cuadrados.
4. Solo da el número de WhatsApp si el cliente muestra interés claro en agendar una cita o contratar.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userQuery }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7
    });

    return chatCompletion.choices[0]?.message?.content || '¡Hola! ¿En qué puedo colaborarte hoy?';

  } catch (error) {
    console.error('❌ Error en el servicio de IA:', error);
    return "¡Hola! Estoy listo para darte información de nuestros servicios de limpieza en La Paz. ¿Qué te gustaría consultar?";
  }
}