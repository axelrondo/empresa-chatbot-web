/* ==========================================
   1. CONTROL DE VISTAS (NAVEGACIÓN SPA)
   ========================================== */

/**
 * Muestra la vista seleccionada y oculta las demás.
 * @param {string} viewId - ID de la sección a mostrar
 */
function showView(viewId) {
  // Ocultar todas las secciones con la clase 'view-section'
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(section => {
    section.classList.add('hidden');
  });

  // Mostrar la vista deseada
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.remove('hidden');
    // Desplazar suavemente al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ==========================================
   2. CARRUSEL / SLIDER PRINCIPAL
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
    dot.className = `w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
      idx === currentSlideIndex ? 'bg-amber-400 w-6' : 'bg-white/60 hover:bg-white'
    }`;
    dot.onclick = () => setSlide(idx);
    container.appendChild(dot);
  });
}

// Rotación automática del slider cada 5 segundos
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

function selectServiceTab(serviceKey) {
  currentSelectedKey = serviceKey;
  const data = servicesData[serviceKey];
  if (!data) return;

  Object.keys(servicesData).forEach(key => {
    const btn = document.getElementById(`btn-${key}`);
    if (btn) {
      if (key === serviceKey) {
        btn.classList.add('bg-emerald-100', 'border-emerald-600', 'text-emerald-900');
        btn.classList.remove('border-gray-200');
      } else {
        btn.classList.remove('bg-emerald-100', 'border-emerald-600', 'text-emerald-900');
        btn.classList.add('border-gray-200');
      }
    }
  });

  const titleEl = document.getElementById('serviceTitle');
  const descEl = document.getElementById('serviceDescription');
  const machineEl = document.getElementById('serviceMachine');
  const imgEl = document.getElementById('serviceImage');

  if (titleEl) titleEl.textContent = data.title;
  if (descEl) descEl.textContent = data.description;
  if (machineEl) machineEl.textContent = `Maquinaria: ${data.machine}`;
  if (imgEl) imgEl.src = data.image;

  onSliderChange();
}

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
          <button onclick="removeCartItem(${idx})" class="text-red-400 hover:text-red-300 text-[10px] underline">Quitar</button>
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
   4. CHAT Y ASISTENTE IA (INTERFAZ)
   ========================================== */

function toggleChat() {
  alert('Iniciando interacción con el Asistente de IA de LIMBOLIVIA...');
}

/* ==========================================
   5. INICIALIZACIÓN AL CARGAR LA PÁGINA
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  showView('view-inicio');
  updateIndicators();
  selectServiceTab('Alfombras');
});