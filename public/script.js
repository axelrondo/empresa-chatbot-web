/* ==========================================
   0. CONFIGURACIÓN E INICIALIZACIÓN DE SUPABASE
   ========================================== */

// Sustituye con tus credenciales reales de tu proyecto de Supabase
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_DE_SUPABASE';

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let isAdminAuthenticated = false;

/* ==========================================
   1. CARGA DINÁMICA DE SECCIONES (NUEVO)
   ========================================== */

// Mapeo de IDs de vista a nombres de archivos
const SECTION_MAP = {
  // Vistas principales
  'view-inicio': 'view-inicio',
  'view-mision-vision': 'view-mision-vision',
  'view-quienes-somos': 'view-quienes-somos',
  'view-principios': 'view-principios',
  'view-24horas': 'view-24horas',
  'view-alfombras-tapizados': 'view-alfombras-tapizados',
  'view-cotizador': 'view-cotizador',
  
  // Servicios (sec-1 a sec-18)
  'sec-1': 'sec-1',
  'sec-2': 'sec-2',
  'sec-3': 'sec-3',
  'sec-4': 'sec-4',
  'sec-5': 'sec-5',
  'sec-6': 'sec-6',
  'sec-7': 'sec-7',
  'sec-8': 'sec-8',
  'sec-9': 'sec-9',
  'sec-10': 'sec-10',
  'sec-11': 'sec-11',
  'sec-12': 'sec-12',
  'sec-13': 'sec-13',
  'sec-14': 'sec-14',
  'sec-15': 'sec-15',
  'sec-16': 'sec-16',
  'sec-17': 'sec-17',
  'sec-18': 'sec-18',
};

// Cache de secciones ya cargadas
const sectionCache = new Map();

async function loadSection(viewId) {
  const sectionKey = SECTION_MAP[viewId];
  if (!sectionKey) {
    console.warn('Sección no encontrada:', viewId);
    return;
  }

  // Verificar si ya está cargada en caché
  if (sectionCache.has(sectionKey)) {
    const content = sectionCache.get(sectionKey);
    const container = document.getElementById(viewId);
    if (container) {
      container.innerHTML = content;
      container.classList.remove('hidden');
      container.classList.add('animate-fade-in');
    }
    return;
  }

  try {
    // Cargar desde archivo HTML
    const response = await fetch(`/sections/${sectionKey}.html`);
    if (!response.ok) throw new Error(`Error loading ${sectionKey}: ${response.status}`);
    
    const content = await response.text();
    sectionCache.set(sectionKey, content);

    const container = document.getElementById(viewId);
    if (container) {
      container.innerHTML = content;
      container.classList.remove('hidden');
      container.classList.add('animate-fade-in');
    }
  } catch (error) {
    console.error('Error loading section:', error);
    const container = document.getElementById(viewId);
    if (container) {
      container.innerHTML = `<div class="bg-white p-8 rounded-2xl shadow-md border border-red-200 text-center">
        <i class="fa-solid fa-triangle-exclamation text-3xl text-red-500"></i>
        <p class="mt-2 text-red-600 font-bold">Error al cargar la sección</p>
        <p class="text-xs text-gray-500 mt-1">Por favor, recargue la página</p>
      </div>`;
    }
  }
}

// Función showView UNIFICADA
window.showView = function(viewId) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view-section').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('animate-fade-in');
  });
  
  // Cargar la vista solicitada
  loadSection(viewId);
  
  // Cerrar todos los dropdowns
  document.querySelectorAll('.dropdown-content').forEach(el => el.classList.add('hidden'));
  
  // Scroll suave con offset
  window.scrollTo({ top: 80, behavior: 'smooth' });

  // Cargar catálogo de maquinaria si se accede a dicha vista
  if (viewId === 'view-venta-maquinaria') {
    setTimeout(loadMachineryProducts, 300);
  }
};

/* ==========================================
   2. CARRUSEL / SLIDER PRINCIPAL (MEJORADO)
   ========================================== */

const slideImages = [
  '/img/banner1.png',
  '/img/banner2.png',
  '/img/banner3.png'
];

let currentSlideIndex = 0;

function updateSlide() {
  const sliderImg = document.getElementById('mainSliderImg');
  if (sliderImg) {
    sliderImg.src = slideImages[currentSlideIndex];
  }
  updateIndicators();
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slideImages.length;
  updateSlide();
}

function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + slideImages.length) % slideImages.length;
  updateSlide();
}

function setSlide(index) {
  currentSlideIndex = index;
  updateSlide();
}

function updateIndicators() {
  const container = document.getElementById('slideIndicatorsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  slideImages.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
      idx === currentSlideIndex ? 'bg-amber-400 w-6' : 'bg-white/60 hover:bg-white w-2.5'
    }`;
    dot.onclick = () => setSlide(idx);
    container.appendChild(dot);
  });
}

// Rotación automática del slider cada 5 segundos (solo si Inicio está visible)
setInterval(() => {
  const inicioSection = document.getElementById('view-inicio');
  if (inicioSection && !inicioSection.classList.contains('hidden')) {
    nextSlide();
  }
}, 5000);

/* ==========================================
   3. LÓGICA DEL COTIZADOR DE SERVICIOS
   ========================================== */

const servicesData = {
  'Alfombras': {
    title: 'Lavado Profesional de Alfombra Fija',
    description: 'Limpieza profunda de alfombra pared a pared con sistema de inyección y extracción.',
    machine: 'Inyectora / Extractora Profesional',
    pricePerM2: 15,
    image: '/img/banner1.png'
  },
  'AlfombraSuelta': {
    title: 'Lavado de Alfombra Suelta / Tapete',
    description: 'Tratamiento delicado y remoción de manchas profundas en taller o a domicilio.',
    machine: 'Lavadora Rotativa + Secado Controlado',
    pricePerM2: 18,
    image: '/img/banner2.png'
  },
  'Oficinas': {
    title: 'Limpieza Integral de Oficinas',
    description: 'Desinfección de mobiliario, equipos, escritorios y pisos institucionales.',
    machine: 'Aspiradoras Industriales HEPA',
    pricePerM2: 12,
    image: '/img/banner3.png'
  },
  'Casas': {
    title: 'Limpieza Profunda de Casas y Dptos.',
    description: 'Higienización total de áreas comunes, cocina, baños y dormitorios.',
    machine: 'Vaporizadores + Pulidoras',
    pricePerM2: 14,
    image: '/img/banner1.png'
  },
  'LustradoFrio': {
    title: 'Lustrado y Brillado de Piso Frío',
    description: 'Aseo, desengrasado y aplicación de cera/sellador en cerámica, granito o mármol.',
    machine: 'Lustradora de Alta Velocidad',
    pricePerM2: 10,
    image: '/img/banner2.png'
  },
  'LustradoMadera': {
    title: 'Tratamiento y Lustrado de Piso de Madera',
    description: 'Protección con ceras especiales para preservar la madera y restaurar el brillo.',
    machine: 'Lustradora Profesional con Felpa',
    pricePerM2: 16,
    image: '/img/banner3.png'
  },
  'Fumigado': {
    title: 'Fumigación y Control de Plagas',
    description: 'Desinsectación y control de plagas con químicos biodegradables y seguros.',
    machine: 'Termonebulizadora / Aspersor de Presión',
    pricePerM2: 8,
    image: '/img/banner1.png'
  },
  'Tanques': {
    title: 'Limpieza y Desinfección de Tanques',
    description: 'Lavado y desinfección química de tanques elevados y cisternas de agua.',
    machine: 'Bomba de Achique + Hidrolavadora',
    pricePerM2: 20,
    image: '/img/banner2.png'
  }
};

let currentSelectedKey = 'Alfombras';
let selectedCartItems = [];

// Versión corregida de selectServiceTab (evita conflictos)
window.selectServiceTab = function(serviceKey) {
  currentSelectedKey = serviceKey;
  const data = servicesData[serviceKey];
  if (!data) return;

  // Actualizar resaltado de botones
  Object.keys(servicesData).forEach(key => {
    const btn = document.getElementById(`btn-${key}`);
    if (btn) {
      if (key === serviceKey) {
        btn.classList.add('bg-emerald-100', 'border-emerald-600', 'text-emerald-900', 'shadow-sm');
        btn.classList.remove('border-gray-200');
      } else {
        btn.classList.remove('bg-emerald-100', 'border-emerald-600', 'text-emerald-900', 'shadow-sm');
        btn.classList.add('border-gray-200');
      }
    }
  });

  // Actualizar textos en la tarjeta de detalle
  const titleEl = document.getElementById('serviceTitle');
  const descEl = document.getElementById('serviceDescription');
  const machineEl = document.getElementById('serviceMachine');
  const imgEl = document.getElementById('serviceImage');

  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.description;
  if (machineEl) machineEl.textContent = `Maquinaria: ${data.machine}`;
  if (imgEl) imgEl.src = data.image;

  onSliderChange();
};

function onSliderChange() {
  const slider = document.getElementById('m2Slider');
  if (!slider) return;
  
  const m2Val = parseInt(slider.value, 10);
  const data = servicesData[currentSelectedKey];

  const m2ValEl = document.getElementById('m2Value');
  const m2SubEl = document.getElementById('m2Subtotal');

  if (m2ValEl) m2ValEl.textContent = `${m2Val} m²`;
  const subtotal = m2Val * data.pricePerM2;
  if (m2SubEl) m2SubEl.textContent = `(Bs ${subtotal})`;
}

function changeM2Step(delta) {
  const slider = document.getElementById('m2Slider');
  if (!slider) return;
  
  let current = parseInt(slider.value, 10) + delta;
  if (current < 1) current = 1;
  if (current > 300) current = 300;
  slider.value = current;
  onSliderChange();
}

function addCurrentMainService() {
  const slider = document.getElementById('m2Slider');
  if (!slider) return;
  
  const m2 = parseInt(slider.value, 10);
  const data = servicesData[currentSelectedKey];
  const totalItem = m2 * data.pricePerM2;

  selectedCartItems.push({
    title: data.title,
    m2: m2,
    subtotal: totalItem
  });

  renderCart();
}

function removeCartItem(index) {
  selectedCartItems.splice(index, 1);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('servicesBreakdown');
  const totalEl = document.getElementById('summaryTotal');
  if (!container || !totalEl) return;

  if (selectedCartItems.length === 0) {
    container.innerHTML = '<p class="text-xs text-gray-400 italic text-center py-4">No has agregado ningún servicio todavía.</p>';
    totalEl.textContent = 'Bs 0';
    return;
  }

  let html = '';
  let grandTotal = 0;

  selectedCartItems.forEach((item, idx) => {
    grandTotal += item.subtotal;
    html += `
      <div class="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg mb-2 text-xs border border-slate-700">
        <div class="pr-2">
          <p class="font-bold text-white">${item.title}</p>
          <p class="text-gray-400">${item.m2} m² x tarifa base</p>
        </div>
        <div class="text-right shrink-0">
          <p class="font-bold text-emerald-400">Bs ${item.subtotal}</p>
          <button onclick="removeCartItem(${idx})" class="text-red-400 hover:text-red-300 text-[10px] underline cursor-pointer">Quitar</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  totalEl.textContent = `Bs ${grandTotal}`;
}

function sendToWhatsApp() {
  if (selectedCartItems.length === 0) {
    alert('Por favor agrega al menos un servicio a tu cotización.');
    return;
  }

  let total = 0;
  let mensaje = 'Hola *LIM-BOLIVIA*, me gustaría solicitar una cotización con el siguiente detalle:\n\n';

  selectedCartItems.forEach((item, i) => {
    mensaje += `*${i + 1}. ${item.title}*\n`;
    mensaje += `   - Superficie: ${item.m2} m²\n`;
    mensaje += `   - Subtotal estimado: Bs ${item.subtotal}\n\n`;
    total += item.subtotal;
  });

  mensaje += `*TOTAL ESTIMADO: Bs ${total}*\n\nQuedo a la espera de su confirmación. ¡Muchas gracias!`;

  const numeroTelefono = '59171506930';
  const url = `https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

/* ==========================================
   4. MODALES Y GESTIÓN DE MAQUINARIA (SUPABASE)
   ========================================== */

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function checkAdminAuth() {
  if (isAdminAuthenticated) {
    document.getElementById('modalUploadMachine').classList.remove('hidden');
  } else {
    document.getElementById('modalAdminLogin').classList.remove('hidden');
  }
}

// Iniciar Sesión de Administrador con Supabase Auth
async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  const errorMsg = document.getElementById('loginErrorMsg');

  if (!supabase) {
    alert('Error: Supabase no está configurado correctamente.');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    isAdminAuthenticated = true;
    errorMsg.classList.add('hidden');
    closeModal('modalAdminLogin');
    document.getElementById('modalUploadMachine').classList.remove('hidden');
  } catch (err) {
    errorMsg.textContent = "Error de autenticación: " + err.message;
    errorMsg.classList.remove('hidden');
  }
}

// Subir Imagen y Guardar Producto en Supabase
async function handleMachineUpload(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitMachine');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Subiendo...`;

  const title = document.getElementById('machineTitle').value;
  const price = document.getElementById('machinePrice').value;
  const description = document.getElementById('machineDescription').value;
  const fileInput = document.getElementById('machineImage');
  const file = fileInput.files[0];

  if (!supabase) {
    alert('Error: Supabase no está configurado.');
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Publicar`;
    return;
  }

  try {
    // Subir Imagen al Bucket de Storage ('maquinarias')
    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('maquinarias')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Obtener URL Pública de la Imagen
    const { data: publicUrlData } = supabase.storage
      .from('maquinarias')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Guardar registro en la tabla 'maquinarias'
    const { error: insertError } = await supabase
      .from('maquinarias')
      .insert([
        {
          titulo: title,
          precio: parseFloat(price),
          descripcion: description,
          imagen_url: imageUrl
        }
      ]);

    if (insertError) throw insertError;

    alert('¡Producto publicado con éxito!');
    document.getElementById('formUploadMachine').reset();
    closeModal('modalUploadMachine');
    loadMachineryProducts();
  } catch (err) {
    alert('Error al publicar el producto: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Publicar`;
  }
}

// Cargar y Mostrar Productos desde Supabase
async function loadMachineryProducts() {
  const container = document.getElementById('machineryGrid');
  if (!container) return;

  if (!supabase) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-amber-600 text-xs font-bold">
        Por favor configura las credenciales de Supabase en script.js para cargar la maquinaria.
      </div>
    `;
    return;
  }
  
  try {
    const { data: products, error } = await supabase
      .from('maquinarias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-8 text-gray-500">
          <p class="text-sm">No hay maquinaria ni productos publicados en este momento.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(prod => `
      <div class="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
        <div class="h-48 bg-slate-200 overflow-hidden relative">
          <img src="${prod.imagen_url}" alt="${prod.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.src='https://via.placeholder.com/300x200?text=Producto';">
          <span class="absolute top-2 right-2 bg-amber-500 text-slate-900 font-black text-xs px-2.5 py-1 rounded-md shadow">
            Bs. ${parseFloat(prod.precio).toFixed(2)}
          </span>
        </div>
        <div class="p-4 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-[#003366] text-base mb-1">${prod.titulo}</h3>
            <p class="text-xs text-gray-600 leading-relaxed">${prod.descripcion}</p>
          </div>
          <a href="https://wa.me/59171506930?text=${encodeURIComponent('Hola, estoy interesado en comprar: ' + prod.titulo)}" target="_blank" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg text-center block transition shadow mt-3">
            <i class="fa-brands fa-whatsapp mr-1"></i> Consultar por WhatsApp
          </a>
        </div>
      </div>
    `).join('');

  } catch (err) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-red-500 text-xs">
        Error al cargar los productos. Verifique la conexión a Supabase.
      </div>
    `;
  }
}

/* ==========================================
   5. ASISTENTE IA (INTEGRACIÓN FUTURA)
   ========================================== */

/**
 * Función para abrir/cerrar el chat con IA
 * Aquí puedes conectar tu backend de IA o usar una API externa
 */
function toggleChat() {
  console.log('🟢 Asistente IA activado');
  
  // Ejemplo de integración: abrir un modal de chat
  // o cargar un iframe con tu chatbot personalizado
  
  // Por ahora, mostramos un mensaje interactivo
  const chatContainer = document.getElementById('chatContainer');
  if (chatContainer) {
    if (chatContainer.classList.contains('hidden')) {
      chatContainer.classList.remove('hidden');
      // Opcional: cargar el chat dinámicamente
      loadChatWidget();
    } else {
      chatContainer.classList.add('hidden');
    }
  } else {
    // Si no hay contenedor, usamos un alert (temporal)
    alert('🤖 Asistente Virtual LIM-BOLIVIA\n\n' +
          'Próximamente podrás chatear con nuestra IA para:\n' +
          '• Cotizar servicios en tiempo real\n' +
          '• Consultar disponibilidad de maquinaria\n' +
          '• Resolver dudas técnicas\n\n' +
          '📱 Mientras tanto, contáctanos por WhatsApp: 71506930');
  }
}

/**
 * Función para cargar el widget de chat (ejemplo con iframe)
 * Puedes conectar aquí con:
 * - Dialogflow
 * - OpenAI API
 * - Un chatbot personalizado en tu backend
 */
function loadChatWidget() {
  const container = document.getElementById('chatContainer');
  if (!container) return;
  
  // Ejemplo: cargar un iframe con tu chatbot
  container.innerHTML = `
    <div class="fixed bottom-24 right-4 w-80 md:w-96 max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
      <div class="bg-[#003366] text-white p-3 flex justify-between items-center">
        <span class="font-bold text-sm flex items-center gap-2">
          <i class="fa-solid fa-robot text-amber-400"></i> Asistente LIM-BOLIVIA
        </span>
        <button onclick="toggleChat()" class="text-white/70 hover:text-white">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="p-4 h-80 overflow-y-auto bg-gray-50">
        <div class="text-center text-xs text-gray-400 mb-4">
          <i class="fa-regular fa-message"></i> Escribe tu consulta
        </div>
        <!-- Aquí irían los mensajes del chat -->
        <div class="bg-white p-3 rounded-lg shadow-sm mb-2">
          <p class="text-xs text-gray-700">👋 ¡Hola! Soy el asistente virtual de LIM-BOLIVIA. ¿En qué puedo ayudarte hoy?</p>
        </div>
      </div>
      <div class="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input type="text" placeholder="Escribe tu mensaje..." class="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500" />
        <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;
}

/* ==========================================
   6. INICIALIZACIÓN AL CARGAR LA PÁGINA
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mostrar Inicio por defecto
  showView('view-inicio');
  
  // Inicializar carrusel
  updateIndicators();
  
  // Inicializar cotizador
  selectServiceTab('Alfombras');
  
  // Cargar productos de maquinaria (si la vista está disponible)
  const machineryView = document.getElementById('view-venta-maquinaria');
  if (machineryView) {
    setTimeout(loadMachineryProducts, 500);
  }
  
  // Cerrar dropdowns al hacer clic fuera
  document.addEventListener('click', function(e) {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dd => {
      if (!dd.contains(e.target)) {
        const content = dd.querySelector('.dropdown-content');
        if (content) content.classList.add('hidden');
      }
    });
  });
  
  console.log('✅ LIM-BOLIVIA WebApp inicializada correctamente');
});