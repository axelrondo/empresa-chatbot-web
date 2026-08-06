import Groq from 'groq-sdk';

export async function askGemini(userQuery) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Datos y precios integrados directamente para evitar fallos de lectura de archivos
    const systemInstruction = `
Eres el asistente virtual amigable, atento y carismático de LIM-BOLIVIA en La Paz, Bolivia.

INFORMACIÓN Y PRECIOS DE LA EMPRESA:
- Servicio de Lavado de Alfombras: Limpieza profunda, eliminación de manchas y desinfección. Precio base aproximado: 15 Bs/m².
- Servicio de Limpieza de Oficinas: Mantenimiento diario o profundo para empresas y escritorios.
- Servicio de Limpieza de Casas/Departamentos: Desinfección integral de salas, cocina, baños y dormitorios.
- Servicio Limpieza Post-Obra: Retiro de escombros finos, pintura y polvo pesado tras remodelaciones.
- Ubicación: La Paz, Bolivia.
- Contacto directo / WhatsApp: 71506930.

REGLAS DE CONDUCTA:
1. Saluda con entusiasmo y responde de forma conversacional, amena y natural.
2. Si preguntan precios o detalles, usa la información anterior y sugiere usar el cotizador interactivo de la página.
3. Solo proporciona el número de WhatsApp (71506930) cuando el cliente manifieste intención directa de agendar o contratar.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userQuery }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7
    });

    return chatCompletion.choices[0]?.message?.content || 'Hola, ¿en qué puedo ayudarte hoy sobre nuestros servicios?';

  } catch (error) {
    console.error('❌ Error en el servicio de IA:', error);
    // Respuesta de respaldo fluida en lugar de arrojar error al cliente
    return "¡Hola! Estoy listo para ayudarte. Contamos con servicios de limpieza de alfombras, casas, oficinas y post-obra en La Paz. ¿Qué servicio te gustaría cotizar?";
  }
}