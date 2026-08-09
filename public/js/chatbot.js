// Variable para historial de conversación acumulativo
let chatHistory = [];

function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  chatBox.classList.toggle('hidden');
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  if (!message) return;

  // 1. Mostrar mensaje del usuario en el chat
  appendMessage('user', message);
  input.value = '';

  // 2. Mostrar animación de "Escribiendo..."
  const loadingId = appendLoading();

  try {
    // Enviamos el mensaje actual junto con el historial acumulado
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

      // 3. Guardar la interacción completa en el historial local
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "assistant", content: data.reply });
    } else {
      throw new Error("Respuesta no válida del servidor");
    }

  } catch (error) {
    console.error("Error en Chatbot:", error);
    removeLoading(loadingId);
    appendMessage('bot', "¡Hola! Disculpa, tuve un pequeño parpadeo en mi conexión. ¿Me podrías repetir tu consulta?");
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
    
    // Reemplazar saltos de línea
    let formattedText = text.replace(/\n/g, '<br>');
    
    // Detectar URLs de wa.me y convertirlas en botón verde cliqueable
    const urlPattern = /(https?:\/\/wa\.me\/[^\s<]+)/g;
    formattedText = formattedText.replace(urlPattern, function(url) {
      return `<a href="${url}" target="_blank" class="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-lg text-xs mt-2 no-underline text-center">📲 Agendar por WhatsApp</a>`;
    });

    msgDiv.innerHTML = `<div>${formattedText}</div>`;

    // Reproducir respuesta por voz
    speak(text);
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

// Función de voz
function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Detener audios anteriores
    
    // Limpiar URLs y HTML antes de hablar
    let cleanText = text.replace(/https?:\/\/[^\s]+/g, '');
    cleanText = cleanText.replace(/<[^>]*>?/gm, '');
    
    if (cleanText.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}