import Groq from 'groq-sdk';
import { getPdfContext } from './pdfService.js';

export async function askGemini(userQuery) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const docsContext = await getPdfContext();

    const systemInstruction = `
Eres el asistente virtual oficial de LIM-BOLIVIA, una empresa experta en servicios de limpieza.
Tu objetivo es responder las dudas de los clientes con amabilidad, precisión y profesionalismo.

REGLAS DE RESPUESTA:
1. Basate estrictamente en la información proporcionada en la sección 'INFORMACIÓN DE LA EMPRESA'.
2. Si la respuesta a la pregunta del usuario no se encuentra en la información proporcionada, responde amablemente indicando que no dispones de ese dato exacto e invita al usuario a contactar directamente por teléfono.
3. Responde siempre en idioma español, usando Bolivianos (Bs) para los precios.
4. Mantén un tono servicial, claro y conciso.

INFORMACIÓN DE LA EMPRESA:
${docsContext.length > 0 ? docsContext : 'No hay documentos cargados en el sistema por el momento.'}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userQuery }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3
    });

    return chatCompletion.choices[0]?.message?.content || 'Sin respuesta del modelo.';
  } catch (error) {
    console.error('❌ Error en el servicio de IA (Groq):', error);
    throw new Error('No se pudo procesar la solicitud con el servicio de IA.');
  }
}