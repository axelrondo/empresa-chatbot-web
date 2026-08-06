import fs from 'fs';
import path from 'path';

export async function getPdfContext() {
  try {
    // process.cwd() obtiene la raíz absoluta del proyecto (funciona tanto en Windows como en Vercel/Render)
    const docsDir = path.join(process.cwd(), 'server', 'docs');

    // Verificar si la carpeta existe
    if (!fs.existsSync(docsDir)) {
      console.warn('⚠️ La carpeta server/docs no existe en la ruta:', docsDir);
      return '';
    }

    const files = fs.readdirSync(docsDir);
    let fullText = '';

    for (const file of files) {
      const filePath = path.join(docsDir, file);

      // Leer archivos .txt o .md
      if (file.endsWith('.txt') || file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        fullText += `\n--- CONTENIDO DE ${file} ---\n${content}\n`;
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error('❌ Error al leer los documentos de contexto:', error);
    return '';
  }
}