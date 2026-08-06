// Variable para historial de conversación
let chatHistory = [
  {
    role: "user",
    parts: [{ text: "Hola, actúa como el asistente virtual amable, atento y experto de la empresa LIM-BOLIVIA en La Paz, Bolivia. Saluda amablemente, responde preguntas con naturalidad y carisma, orienta con detalles sobre limpieza de alfombras, oficinas y casas, y solo ofrece WhatsApp si el cliente pide agendar o coordinar un servicio." }]
  },
  {
    role: "model",
    parts: [{ text: "¡Entendido! Hola, soy el asistente de LIM-BOLIVIA. Estoy aquí para ayudarte de forma amable y resolver todas tus dudas sobre nuestros servicios de limpieza profesional." }]
  }
];

function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  chatBox.classList.toggle('hidden');
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;

  // Mostrar mensaje del usuario
  appendMessage('user', message);
  input.value = '';

  // Mostrar indicador de "Escribiendo..."
  const loadingId = appendLoading();

  try {
    // Petición a tu backend Node.js (/api/chat)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: message,
        history: chatHistory 
      })
    });

    const data = await response.json();
    removeLoading(loadingId);

    if (data && data.reply) {
      appendMessage('bot', data.reply);
      // Guardar en el historial local
      chatHistory.push({ role: "user", parts: [{ text: message }] });
      chatHistory.push({ role: "model", parts: [{ text: data.reply }] });
    } else {
      throw new Error("Respuesta no válida del servidor");
    }

  } catch (error) {
    console.error("Error en Chatbot:", error);
    removeLoading(loadingId);
    // Respuesta amigable en lugar del bot rígido de WhatsApp
    appendMessage('bot', "¡Hola! Disculpa, tuve un pequeño parpadeo en mi conexión. ¿Me podrías repetir tu consulta? Con gusto te doy todos los detalles de nuestros precios y servicios de limpieza.");
  }
}

function appendMessage(sender, text) {
  const chatMessages = document.getElementById('chatMessages');
  const msgDiv = document.createElement('div');
  
  if (sender === 'user') {
    msgDiv.className = 'bg-emerald-600 text-white p-3 rounded-xl ml-auto max-w-[80%] text-xs shadow-sm';
    msgDiv.textContent = text;
  } else {
    msgDiv.className = 'bg-slate-800 text-gray-100 p-3 rounded-xl mr-auto max-w-[85%] text-xs border border-slate-700 shadow-sm space-y-2';
    
    // Convertir saltos de línea simples
    let formattedText = text.replace(/\n/g, '<br>');
    msgDiv.innerHTML = `<div>${formattedText}</div>`;
  }

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendLoading() {
  const chatMessages = document.getElementById('chatMessages');
  const id = 'loading-' + Date.now();
  const loadingDiv = document.createElement('div');
  loadingDiv.id = id;
  loadingDiv.className = 'bg-slate-800 text-emerald-400 p-3 rounded-xl mr-auto text-xs flex items-center gap-2';
  loadingDiv.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Escribiendo...</span>`;
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}

function removeLoading(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Reconocimiento de voz (micrófono)
function startListening() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Tu navegador no soporta reconocimiento de voz.");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-BO';
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('userInput').value = transcript;
    sendMessage();
  };
}

// Función para reproducir voz
function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Detener audios anteriores
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // O 'es-MX' / 'es-BO'
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}