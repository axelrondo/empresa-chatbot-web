// ==========================================
// VARIABLES GLOBALES
// ==========================================
let chatHistory = [];
let audioActual = null;         // Audio de Groq TTS
let vozSeleccionada = null;      // Voz del navegador (fallback)
let audioDesbloqueado = false;
let saludoInicialDado = false;

// ==========================================
// TOGGLE CHAT
// ==========================================
function toggleChat() {
    desbloquearAudioMobile();
    const chatBox = document.getElementById('chatBox');
    const triggerBtn = document.getElementById('aiTriggerBtn');
    const floatingAvatar = document.getElementById('aiFloatingAvatar');
    const widgetContainer = document.querySelector('.ai-widget-container');

    if (!chatBox) return;

    const estaOculto = chatBox.classList.contains('hidden');

    if (estaOculto) {
        // ABRIR CHAT
        chatBox.classList.remove('hidden');
        if (triggerBtn) triggerBtn.classList.add('hidden');
        if (floatingAvatar) floatingAvatar.classList.add('hidden');
        if (widgetContainer) widgetContainer.classList.add('hidden');

        const chatMessages = document.getElementById('chatMessages');
        const mensajeBienvenida = "¡Hola! Bienvenido a Lim Bolivia. ¿En qué te puedo ayudar hoy?";

        if (chatMessages && chatMessages.children.length === 0) {
            appendMessage('bot', mensajeBienvenida);
        }

        if (!saludoInicialDado) {
            hablarTexto(mensajeBienvenida);
            saludoInicialDado = true;
        }
    } else {
        // CERRAR CHAT
        chatBox.classList.add('hidden');
        if (triggerBtn) triggerBtn.classList.remove('hidden');
        if (floatingAvatar) floatingAvatar.classList.remove('hidden');
        if (widgetContainer) widgetContainer.classList.remove('hidden');

        // Detener audio al cerrar
        detenerTodoAudio();
    }
}

// ==========================================
// ENVIAR MENSAJE
// ==========================================
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    // 1. Mostrar mensaje del usuario
    appendMessage('user', message);
    input.value = '';

    // 2. Mostrar "Escribiendo..."
    const loadingId = appendLoading();

    try {
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

            // 3. Guardar en historial
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

// ==========================================
// MOSTRAR MENSAJE EN EL CHAT
// ==========================================
function appendMessage(sender, text) {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');

    if (sender === 'user') {
        msgDiv.className = 'bg-emerald-600 text-white p-3 rounded-xl ml-auto max-w-[80%] text-xs shadow-sm';
        msgDiv.textContent = text;
    } else {
        msgDiv.className = 'bg-slate-800 text-gray-100 p-3 rounded-xl mr-auto max-w-[85%] text-xs border border-slate-700 shadow-sm space-y-2';

        let formattedText = text.replace(/\n/g, '<br>');

        // Detectar URLs de wa.me → botón verde
        const urlPattern = /(https?:\/\/wa\.me\/[^\s<]+)/g;
        formattedText = formattedText.replace(urlPattern, function (url) {
            return `<a href="${url}" target="_blank" class="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-lg text-xs mt-2 no-underline text-center">📲 Agendar por WhatsApp</a>`;
        });

        msgDiv.innerHTML = `<div>${formattedText}</div>`;

        // 🔊 Reproducir respuesta por voz (Groq TTS + fallback)
        hablarTexto(text);
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==========================================
// ANIMACIÓN "ESCRIBIENDO..."
// ==========================================
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

// ==========================================
// 🎙️ RECONOCIMIENTO DE VOZ (MICRÓFONO)
// ==========================================
function startListening() {
    // 🔇 DETENER AUDIO DEL CHATBOT (Groq TTS o Web Speech)
    detenerTodoAudio();

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Tu navegador no soporta reconocimiento de voz.");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-BO';
    recognition.continuous = false;
    recognition.interimResults = false;

    // Cambiar visual del botón
    recognition.onstart = function () {
        const micBtn = document.querySelector('[onclick="startListening()"]');
        if (micBtn) {
            micBtn.classList.add('bg-red-600', 'animate-pulse');
            micBtn.classList.remove('bg-slate-700');
        }
        const input = document.getElementById('userInput');
        if (input) input.placeholder = "🎤 Escuchando...";
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        console.log('📝 Texto reconocido:', transcript);

        const input = document.getElementById('userInput');
        if (input) {
            input.value = transcript;
            input.placeholder = "Escribe tu mensaje...";
        }

        // Restaurar botón
        const micBtn = document.querySelector('[onclick="startListening()"]');
        if (micBtn) {
            micBtn.classList.remove('bg-red-600', 'animate-pulse');
            micBtn.classList.add('bg-slate-700');
        }

        // Enviar automáticamente
        setTimeout(() => sendMessage(), 100);
    };

    recognition.onerror = function (event) {
        console.error('Error de micrófono:', event.error);
        const micBtn = document.querySelector('[onclick="startListening()"]');
        if (micBtn) {
            micBtn.classList.remove('bg-red-600', 'animate-pulse');
            micBtn.classList.add('bg-slate-700');
        }
        const input = document.getElementById('userInput');
        if (input) input.placeholder = "Escribe tu mensaje...";
    };

    recognition.onend = function () {
        const micBtn = document.querySelector('[onclick="startListening()"]');
        if (micBtn) {
            micBtn.classList.remove('bg-red-600', 'animate-pulse');
            micBtn.classList.add('bg-slate-700');
        }
        const input = document.getElementById('userInput');
        if (input) input.placeholder = "Escribe tu mensaje...";
    };

    recognition.start();
}

// ==========================================
// 🔊 HABLAR TEXTO - GROQ TTS + FALLBACK
// ==========================================
async function hablarTexto(texto) {
    if (!texto || texto.trim() === '') return;

    // 1. Detener cualquier audio previo
    detenerTodoAudio();

    // 2. Limpiar texto
    const textoLimpio = limpiarTexto(texto);
    if (!textoLimpio) return;

    console.log('🔊 Hablando:', textoLimpio.substring(0, 80) + '...');

    // 3. Intentar con Groq TTS
    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textoLimpio })
        });

        // Si el servidor falla → usar fallback
        if (!response.ok) {
            console.warn('⚠️ Groq TTS no disponible, usando fallback');
            hablarTextoFallback(textoLimpio);
            return;
        }

        // 4. Reproducir audio de Groq
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        audioActual = new Audio(audioUrl);
        audioActual.volume = 1.0;

        await audioActual.play();

        // Liberar memoria al terminar
        audioActual.onended = () => {
            URL.revokeObjectURL(audioUrl);
            audioActual = null;
            console.log('✅ Audio Groq terminado');
        };

        audioActual.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            audioActual = null;
            console.warn('⚠️ Error reproduciendo Groq TTS, usando fallback');
            hablarTextoFallback(textoLimpio);
        };

    } catch (error) {
        console.warn('⚠️ Error con Groq TTS:', error.message);
        hablarTextoFallback(textoLimpio);
    }
}

// ==========================================
// 🔄 FALLBACK - Web Speech API (voz navegador)
// ==========================================
function hablarTextoFallback(texto) {
    if (!('speechSynthesis' in window)) {
        console.warn('⚠️ Web Speech API no soportada');
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);

    if (!vozSeleccionada) cargarVoces();
    if (vozSeleccionada) utterance.voice = vozSeleccionada;

    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
    console.log('🔄 Usando Web Speech API (fallback)');
}

// ==========================================
// DETENER TODO AUDIO
// ==========================================
function detenerTodoAudio() {
    // Detener Groq TTS
    if (audioActual) {
        try {
            audioActual.pause();
            audioActual.currentTime = 0;
        } catch (e) { }
        audioActual = null;
    }

    // Detener Web Speech
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// ==========================================
// LIMPIAR TEXTO PARA TTS
// ==========================================
function limpiarTexto(texto) {
    if (!texto) return '';

    return texto
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/`/g, '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/LIM-BOLIVIA/gi, 'Lim Bolivia')
        .replace(/Lim-Bolivia/gi, 'Lim Bolivia')
        // Números de teléfono legibles
        .replace(/\+?\s*591\s*730\s*17175/g, 'setenta y tres cero diez y siete diez y siete cinco')
        .replace(/73017175/g, 'setenta y tres cero diez y siete diez y siete cinco')
        // Símbolos
        .replace(/&/g, ' y ')
        .replace(/%/g, ' por ciento ')
        .replace(/\s+/g, ' ')
        .trim();
}

// ==========================================
// CARGAR VOCES DEL NAVEGADOR (fallback)
// ==========================================
function cargarVoces() {
    if (!('speechSynthesis' in window)) return;
    const voces = window.speechSynthesis.getVoices();
    if (voces.length > 0) {
        vozSeleccionada = voces.find(v =>
            v.lang.includes('es-MX') ||
            v.lang.includes('es-ES') ||
            v.lang.startsWith('es')
        ) || voces[0];
        console.log('🎤 Voz seleccionada (fallback):', vozSeleccionada?.name);
    }
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = cargarVoces;
    cargarVoces();
}

// ==========================================
// DESBLOQUEAR AUDIO EN MÓVIL
// ==========================================
function desbloquearAudioMobile() {
    if (audioDesbloqueado) return;

    // Desbloquear Web Speech
    if ('speechSynthesis' in window) {
        const silencio = new SpeechSynthesisUtterance('');
        silencio.volume = 0;
        window.speechSynthesis.speak(silencio);
    }

    // Desbloquear Audio HTML5
    try {
        const audioTest = new Audio();
        audioTest.volume = 0;
        audioTest.play().catch(() => { });
    } catch (e) { }

    audioDesbloqueado = true;
    console.log('🔓 Audio desbloqueado para móvil');
}

document.addEventListener('touchstart', desbloquearAudioMobile, { once: true });
document.addEventListener('click', desbloquearAudioMobile, { once: true });

console.log('✅ chatbot.js cargado - Groq TTS + Fallback activado');