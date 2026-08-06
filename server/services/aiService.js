import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function askGemini(userQuery) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Intenta buscar informacion.txt o variantes de doble punto
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
      infoEmpresa = 'LIM-BOLIVIA: Empresa de limpieza profesional en La Paz, Bolivia. Servicios de alfombras, oficinas y casas. WhatsApp: 71506930.';
    }

    const systemInstruction = `
Eres el asistente virtual amable, atento y carismático de LIM-BOLIVIA en La Paz, Bolivia.

INFORMACIÓN DE LA EMPRESA:
${infoEmpresa}

REGLAS DE CONDUCTA:
1. Saluda con entusiasmo y conversa con amabilidad.
2. Orienta con los precios y detalles que están en la información de la empresa.
3. Si el usuario pregunta precios, invítalo amablemente a probar el cotizador que está arriba.
4. Entrega el WhatsApp (71506930) solo si piden agendar un servicio.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userQuery }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7
    });

    return chatCompletion.choices[0]?.message?.content || '¡Hola! ¿En qué puedo ayudarte hoy?';

  } catch (error) {
    console.error('❌ Error en el servicio de IA:', error);
    // Respuesta fluida en lugar de lanzar excepción que rompa el fetch
    return "¡Hola! Estoy listo para ayudarte con información sobre nuestros servicios de limpieza en La Paz. ¿Qué te gustaría consultar?";
  }
}