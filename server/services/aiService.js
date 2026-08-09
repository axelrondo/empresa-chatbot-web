import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function askGemini(userQuery, chatHistory = []) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Intenta buscar informacion.txt o variantes de ruta
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

    // Formatear el historial previo que viene del cliente/controlador
    // Groq requiere objetos con { role: "user" | "assistant", content: "..." }
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.content || msg.text || ''
    }));

    // Construcción del flujo completo de mensajes
    const messages = [
      { 
        role: 'system', 
        content: infoEmpresa 
      },
      ...formattedHistory,
      { 
        role: 'user', 
        content: userQuery 
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5
    });

    return chatCompletion.choices[0]?.message?.content || '¡Hola! ¿En qué puedo ayudarte hoy?';

  } catch (error) {
    console.error('❌ Error en el servicio de IA:', error);
    return "¡Hola! Tuve un inconveniente momentáneo. ¿Podrías indicarme nuevamente qué servicio deseas cotizar?";
  }
}