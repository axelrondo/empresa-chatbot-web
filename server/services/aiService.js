import Groq from 'groq-sdk';
import { getPdfContext } from './pdfService.js';

export async function askGemini(userQuery) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    let docsContext = '';

    try {
      docsContext = await getPdfContext();
    } catch (err) {
      console.warn('⚠️ No se pudo cargar el contexto PDF:', err.message);
    }

    const systemInstruction = `
Eres el asistente virtual oficial de LIM-BOLIVIA, ubicado en La Paz, Bolivia.
Tu personalidad es extremadamente amable, atenta, carismática y servicial.

REGLAS DE CONDUCTA Y CONVERSACIÓN:
1. Saluda con calidez y conversa amablemente sobre temas generales o consultas del usuario.
2. Utiliza la 'INFORMACIÓN DE LA EMPRESA' como guía principal de precios (en Bolivianos Bs) y detalles técnicos de servicios (limpieza de alfombras, casas, oficinas, post-obra).
3. Si el usuario te hace charla casual o preguntas generales, responde amigablemente y con buena disposición.
4. Solo sugiere el número de contacto o WhatsApp si el usuario expresamente pide agendar un servicio o hablar con un asesor humano.

INFORMACIÓN DE LA EMPRESA:
${docsContext && docsContext.length > 0 ? docsContext : 'Servicios de limpieza profesional en Bolivia.'}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userQuery }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7
    });

    return chatCompletion.choices[0]?.message?.content || 'Sin respuesta del modelo.';
  } catch (error) {
    console.error('❌ Error en el servicio de IA (Groq):', error);
    throw new Error('No se pudo procesar la solicitud con el servicio de IA.');
  }
}