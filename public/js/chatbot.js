// Variables globales de control
let initialGreetingSpoken = false;
let synthesisVoices = [];

// Puerto dinámico del Backend (Local vs Producción)
const BACKEND_URL = window.location.origin.includes('5500') || window.location.origin.includes('5501') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:3000/api/chat'
  : '/api/chat';

// Cargar voces del sistema para Text-to-Speech
function loadVoices() {
  if ('speechSynthesis' in window) {
    synthesisVoices = window.speechSynthesis.getVoices();
  }
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

// Abrir / Cerrar la ventana del Chatbot
function toggleChat() {
  const chatBox = document.getElementById('chatBox');
  if (!chatBox) return;

  chatBox.classList.toggle('hidden');

  if (!chatBox.classList.contains('hidden')) {
    const input = document.getElementById('userInput');
    if (input) input.focus();

    // Saludo inicial por voz solo al abrir por primera vez
    if (!initialGreetingSpoken) {
      const initialMessage = "¡Hola! Soy tu asistente de LIM-BOLIVIA. ¿En qué puedo ayudarte hoy sobre nuestros servicios de limpieza?";
      speakText(initialMessage);
      initialGreetingSpoken = true;
    }
  }
}

// Enviar mensaje del usuario al servidor / IA
async function sendMessage() {
  const input = document.getElementById('userInput');
  const chatMessages = document.getElementById('chatMessages');

  if (!input || !chatMessages) return;

  const text = input.value.trim();
  if (!text) return;

  // 1. Mostrar mensaje del usuario
  appendMessage(text, 'user');
  input.value = '';

  // 2. Mostrar indicador de procesando
  const loadingId = 'loading-' + Date.now();
  const loadingDiv = document.createElement('div');
  loadingDiv.id = loadingId;
  loadingDiv.className = 'bg-slate-800 text-emerald-400 p-3 rounded-xl max-w-[85%] self-start border border-slate-700 flex items-center gap-2';
  loadingDiv.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> <span class="text-xs text-gray-400">Pensando...</span>`;
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const loader = document.getElementById(loadingId);
    if (loader) loader.remove();

    if (!response.ok) throw new Error(`Status HTTP: ${response.status}`);

    const data = await response.json();
    const replyText = data.reply || data.response || data.message;

    appendMessage(replyText, 'bot');
    speakText(replyText);

  } catch (error) {
    console.error('Error al conectar con la API de Chat:', error);

    const loader = document.getElementById(loadingId);
    if (loader) loader.remove();

    // Respuestas cordiales de respaldo si la API no está disponible
    const friendlyFallback = getFriendlyFallback(text);
    appendMessage(friendlyFallback, 'bot');
    speakText(friendlyFallback);
  }
}

// Generador de respuestas cordiales en modo offline/fallback
function getFriendlyFallback(input) {
  const lower = input.toLowerCase();

  if (lower.includes('hola') || lower.includes('buenas')) {
    return "¡Hola! Qué gusto saludarte. ¿Cómo te encuentras hoy? ¿Te gustaría saber más sobre el lavado de alfombras o limpieza de oficinas?";
  }
  if (lower.includes('como estas') || lower.includes('cómo estás')) {
    return "¡Estoy excelente y con mucha energía para ayudarte! 😄 ¿En qué puedo colaborarte hoy con la limpieza de tu espacio?";
  }
  if (lower.includes('gracias')) {
    return "¡Con el mayor de los gustos! Estoy para servirte en lo que necesites.";
  }

  return "¡Excelente consulta! Si deseas cotizar un trabajo o agendar directamente, puedes usar nuestro cotizador o pulsar el botón para coordinar con un agente por WhatsApp.";
}

// Renderizar mensajes en el DOM con botón interactivo de WhatsApp cuando corresponda
function appendMessage(text, sender) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const msgDiv = document.createElement('div');

  if (sender === 'user') {
    msgDiv.className = 'bg-emerald-600 text-white p-3 rounded-xl max-w-[85%] ml-auto shadow-sm text-sm';
    msgDiv.innerText = text;
  } else {
    msgDiv.className = 'bg-slate-800 text-gray-200 p-3 rounded-xl max-w-[85%] mr-auto border border-slate-700 shadow-sm space-y-2 text-sm';
    
    const textNode = document.createElement('p');
    textNode.innerText = text;
    msgDiv.appendChild(textNode);

    // Si la respuesta trata sobre cotizar, reservar o un agente, inserta el botón directo a WhatsApp
    const lowerText = text.toLowerCase();
    if (
      lowerText.includes('cotizar') || 
      lowerText.includes('reserva') || 
      lowerText.includes('whatsapp') || 
      lowerText.includes('agente') || 
      lowerText.includes('precio') || 
      lowerText.includes('consulta')
    ) {
      const waBtn = document.createElement('a');
      waBtn.href = "https://wa.me/59171506930?text=Hola%20LIM-BOLIVIA,%20estoy%20consultando%20desde%20el%20chatbot%20y%20deseo%20atencion%20personalizada.";
      waBtn.target = "_blank";
      waBtn.rel = "noopener noreferrer";
      waBtn.className = "inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg mt-2 transition shadow";
      waBtn.innerHTML = `<i class="fa-brands fa-whatsapp text-sm"></i> Contactar Agente (71506930)`;
      msgDiv.appendChild(waBtn);
    }
  }

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Reconocimiento de voz mediante micrófono
function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Tu navegador no soporta entrada por micrófono.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;

  const input = document.getElementById('userInput');

  recognition.onstart = () => { if (input) input.placeholder = 'Escuchando tu voz...'; };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (input) {
      input.value = transcript;
      sendMessage();
    }
  };
  recognition.onerror = () => { if (input) input.placeholder = 'Escribe tu mensaje...'; };
  recognition.onend = () => { if (input) input.placeholder = 'Escribe tu mensaje...'; };

  recognition.start();
}

// Reproducción de voz (Text-to-Speech)
function speakText(text) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // Detener audios anteriores

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 1.0;

  if (synthesisVoices.length === 0) loadVoices();
  const esVoice = synthesisVoices.find(v => v.lang.startsWith('es'));
  if (esVoice) utterance.voice = esVoice;

  window.speechSynthesis.speak(utterance);
}

let preciosData = {};

// Carga el archivo al iniciar
fetch('doc/precios.json')
  .then(res => res.json())
  .then(data => {
    preciosData = data;
    console.log("Precios cargados correctamente desde el archivo:", preciosData);
  })
  .catch(err => console.error("Error al cargar precios:", err));

  let baseConocimiento = "";

// Cargar automáticamente el documento desde la carpeta doc/
document.addEventListener('DOMContentLoaded', () => {
  fetch('doc/precios.txt')
    .then(respuesta => {
      if (!respuesta.ok) throw new Error("No se pudo cargar el documento");
      return respuesta.text();
    })
    .then(texto => {
      baseConocimiento = texto;
      console.log("Documento de precios cargado con éxito en el Hosting.");
    })
    .catch(error => console.error("Error al leer la carpeta doc:", error));
});

