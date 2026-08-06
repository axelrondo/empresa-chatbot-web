// Configuración de los servicios con sus imágenes correspondientes
const servicesConfig = {
  'Alfombras': {
    title: 'Lavado Profesional de Alfombras',
    description: 'Lavado profundo de alfombras de todo tipo: pelo grueso, medio y alto tráfico. Eliminación de manchas y desinfección.',
    image: 'img/banner1.png',
    basePrice: 80,
    pricePerM2: 12,
    colorClass: 'bg-red-500 hover:bg-red-600 border-red-600',
    activeRing: 'ring-4 ring-red-300',
    extras: [
      { id: 'ext-ribete', name: 'Ribeteado y costura de bordes', price: 50 },
      { id: 'ext-fijacion', name: 'Colocado y fijación de alfombra', price: 70 },
      { id: 'ext-manchas', name: 'Protector antimanchas', price: 60 }
    ]
  },
  'Oficinas': {
    title: 'Limpieza Integral de Oficinas',
    description: 'Mantenimiento y desinfección de puestos de trabajo, cristales internos, escritorios y desinfección general.',
    image: 'img/banner2.png',
    basePrice: 120,
    pricePerM2: 8,
    colorClass: 'bg-blue-600 hover:bg-blue-700 border-blue-700',
    activeRing: 'ring-4 ring-blue-300',
    extras: [
      { id: 'ext-alfombra-ofic', name: 'Lavado de alfombra/moqueta integrada', price: 90 },
      { id: 'ext-vidrios-ext', name: 'Limpieza de vidrios exteriores', price: 100 },
      { id: 'ext-pulido-piso', name: 'Pulido y encerado de pisos', price: 110 }
    ]
  },
  'Casas': {
    title: 'Limpieza Profunda de Casas y Dptos',
    description: 'Limpieza de cocina, baños, dormitorios, salas y desinfección integral de ambientes residenciales.',
    image: 'img/banner3.png',
    basePrice: 100,
    pricePerM2: 7,
    colorClass: 'bg-amber-500 hover:bg-amber-600 border-amber-600',
    activeRing: 'ring-4 ring-amber-300',
    extras: [
      { id: 'ext-alfombra-suelta', name: 'Lavado de alfombra suelta', price: 40 },
      { id: 'ext-alfombra-fija', name: 'Lavado de alfombra fija / moqueta', price: 80 },
      { id: 'ext-horno-nevera', name: 'Limpieza profunda de horno y refrigerador', price: 70 }
    ]
  },
  'Post-Obra': {
    title: 'Limpieza Especializada Post-Construcción',
    description: 'Remoción de residuos de pintura, cemento, fino de obra en cristales, marcos, pisos y desinfección total.',
    image: 'img/banner4.png',
    basePrice: 180,
    pricePerM2: 15,
    colorClass: 'bg-sky-400 hover:bg-sky-500 border-sky-500',
    activeRing: 'ring-4 ring-sky-200',
    extras: [
      { id: 'ext-desmonte', name: 'Retiro de escombros livianos', price: 120 },
      { id: 'ext-vidrios-altura', name: 'Limpieza de ventanales de altura', price: 150 },
      { id: 'ext-lavado-alfombra-post', name: 'Lavado de alfombras post-obra', price: 85 }
    ]
  }
};

// Servicio activo en borrador
let previewService = {
  key: 'Alfombras',
  m2: 15,
  selectedExtras: []
};

// Objeto de servicios agregados
let quotedServices = {};

// Selección de pestaña
function selectServiceTab(key) {
  previewService.key = key;
  if (quotedServices[key]) {
    previewService.m2 = quotedServices[key].m2;
    previewService.selectedExtras = [...quotedServices[key].selectedExtras];
  } else {
    previewService.m2 = 15;
    previewService.selectedExtras = [];
  }
  updateUI();
}

// Pasos +/- (1 en 1 m²)
function changeM2Step(amount) {
  let newM2 = previewService.m2 + amount;
  if (newM2 < 5) newM2 = 5;
  if (newM2 > 500) newM2 = 500;

  previewService.m2 = newM2;

  const slider = document.getElementById('m2Slider');
  if (slider) slider.value = newM2;

  document.getElementById('m2Value').innerText = `${previewService.m2} m²`;

  if (quotedServices[previewService.key]) {
    quotedServices[previewService.key].m2 = previewService.m2;
    calculateTotal();
  }
}

// Slider (5 en 5 m²)
function onSliderChange() {
  const slider = document.getElementById('m2Slider');
  if (!slider) return;

  previewService.m2 = parseInt(slider.value) || 5;
  document.getElementById('m2Value').innerText = `${previewService.m2} m²`;

  if (quotedServices[previewService.key]) {
    quotedServices[previewService.key].m2 = previewService.m2;
    calculateTotal();
  }
}

// Checkbox extras
function toggleExtra(extraId, extraPrice, extraName) {
  const index = previewService.selectedExtras.findIndex(e => e.id === extraId);
  if (index > -1) {
    previewService.selectedExtras.splice(index, 1);
  } else {
    previewService.selectedExtras.push({ id: extraId, name: extraName, price: extraPrice });
  }

  if (quotedServices[previewService.key]) {
    quotedServices[previewService.key].selectedExtras = [...previewService.selectedExtras];
    calculateTotal();
  }
}

// Agregar servicio a la cotización
function addCurrentToQuote() {
  quotedServices[previewService.key] = {
    m2: previewService.m2,
    selectedExtras: [...previewService.selectedExtras]
  };
  calculateTotal();
}

// Eliminar servicio
function removeServiceFromQuote(key) {
  delete quotedServices[key];
  calculateTotal();
}

// Actualizar interfaz del cotizador
function updateUI() {
  const conf = servicesConfig[previewService.key];
  if (!conf) return;

  document.getElementById('serviceImage').src = conf.image;
  document.getElementById('serviceTitle').innerText = conf.title;
  document.getElementById('serviceDescription').innerText = conf.description;

  Object.keys(servicesConfig).forEach(key => {
    const btn = document.getElementById(`btn-${key}`);
    const cfg = servicesConfig[key];
    if (!btn) return;

    if (key === previewService.key) {
      btn.className = `p-3 border-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-2 shadow-md text-white ${cfg.colorClass} ${cfg.activeRing}`;
    } else {
      btn.className = `p-3 border-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-2 shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300`;
    }
  });

  const slider = document.getElementById('m2Slider');
  if (slider) slider.value = previewService.m2;
  document.getElementById('m2Value').innerText = `${previewService.m2} m²`;

  const extrasContainer = document.getElementById('extrasContainer');
  if (extrasContainer) {
    extrasContainer.innerHTML = conf.extras.map(e => {
      const isChecked = previewService.selectedExtras.some(ex => ex.id === e.id);
      return `
        <label class="flex items-center gap-2 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition border text-gray-800">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleExtra('${e.id}', ${e.price}, '${e.name}')" class="accent-emerald-600 w-4 h-4">
          <span class="text-xs font-semibold">${e.name} <strong class="text-emerald-700">(+Bs ${e.price})</strong></span>
        </label>
      `;
    }).join('');
  }
}

// Renderizar totales y lista desglosada
function calculateTotal() {
  let grandTotal = 0;
  let summaryHtml = '';

  const keys = Object.keys(quotedServices);

  if (keys.length === 0) {
    summaryHtml = `
      <div class="text-center py-8 text-gray-400 text-xs">
        <i class="fa-solid fa-cart-flatbed text-3xl mb-2 text-slate-600 block"></i>
        No has agregado ningún servicio a la cotización aún.<br>Selecciona las opciones y haz clic en <strong>"Agregar a Cotización"</strong>.
      </div>
    `;
  } else {
    keys.forEach(key => {
      const sData = quotedServices[key];
      const conf = servicesConfig[key];

      const m2Subtotal = sData.m2 * conf.pricePerM2;
      const extrasSubtotal = sData.selectedExtras.reduce((sum, item) => sum + item.price, 0);
      const serviceTotal = conf.basePrice + m2Subtotal + extrasSubtotal;

      grandTotal += serviceTotal;
      let itemCounter = 1;

      summaryHtml += `
        <div class="border-b border-slate-700/80 pb-3 mb-3 relative">
          <button onclick="removeServiceFromQuote('${key}')" class="absolute top-0 right-0 text-red-400 hover:text-red-300 text-xs font-bold" title="Eliminar servicio">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          
          <div class="text-emerald-400 font-extrabold text-sm uppercase tracking-wider mb-2 pr-6">
            ${key} (${sData.m2} m²)
          </div>
          
          <div class="space-y-1 pl-2 text-xs">
            <div class="flex justify-between items-center text-gray-300">
              <span>${itemCounter++}. Servicio Base</span>
              <span class="text-amber-400 font-bold">Bs ${conf.basePrice}</span>
            </div>

            <div class="flex justify-between items-center text-gray-300">
              <span>${itemCounter++}. Área (${sData.m2} m² x Bs ${conf.pricePerM2})</span>
              <span class="text-amber-400 font-bold">Bs ${m2Subtotal}</span>
            </div>
      `;

      if (sData.selectedExtras.length > 0) {
        sData.selectedExtras.forEach(extra => {
          summaryHtml += `
            <div class="flex justify-between items-center text-gray-300">
              <span>${itemCounter++}. ${extra.name}</span>
              <span class="text-amber-400 font-bold">Bs ${extra.price}</span>
            </div>
          `;
        });
      }

      summaryHtml += `
            <div class="flex justify-between items-center text-emerald-300 font-bold pt-1 border-t border-slate-800 mt-1">
              <span>Subtotal ${key}</span>
              <span class="text-amber-400">Bs ${serviceTotal}</span>
            </div>
          </div>
        </div>
      `;
    });
  }

  const summaryContainer = document.getElementById('servicesBreakdown');
  if (summaryContainer) summaryContainer.innerHTML = summaryHtml;

  const totalEl = document.getElementById('summaryTotal');
  if (totalEl) totalEl.innerText = `Bs ${grandTotal}`;
}

// Enviar a WhatsApp
function sendToWhatsApp() {
  const keys = Object.keys(quotedServices);
  if (keys.length === 0) {
    alert("Por favor, agrega al menos un servicio a la cotización antes de reservar por WhatsApp.");
    return;
  }

  const phone = "59171506930";
  let message = "👋 *¡Hola LIM-BOLIVIA! Deseo confirmar la siguiente cotización:*\n\n";
  let grandTotal = 0;

  keys.forEach(key => {
    const sData = quotedServices[key];
    const conf = servicesConfig[key];

    const m2Subtotal = sData.m2 * conf.pricePerM2;
    const extrasSubtotal = sData.selectedExtras.reduce((sum, item) => sum + item.price, 0);
    const serviceTotal = conf.basePrice + m2Subtotal + extrasSubtotal;

    grandTotal += serviceTotal;
    let itemCounter = 1;

    message += `📋 *${conf.title} (${sData.m2} m²)*\n`;
    message += ` ${itemCounter++}.- Servicio Base: Bs ${conf.basePrice}\n`;
    message += ` ${itemCounter++}.- Área (${sData.m2} m² x Bs ${conf.pricePerM2}): Bs ${m2Subtotal}\n`;

    if (sData.selectedExtras.length > 0) {
      sData.selectedExtras.forEach(e => {
        message += ` ${itemCounter++}.- ${e.name}: Bs ${e.price}\n`;
      });
    }
    
    message += ` *Subtotal ${key}: Bs ${serviceTotal}*\n\n`;
  });

  message += `💰 *TOTAL GENERAL: Bs ${grandTotal}*\n\n`;
  message += `Quedo atento para coordinar la dirección y fecha del servicio. ¡Gracias!`;

  const encodedUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(encodedUrl, '_blank');
}

// Lectura por Voz
function talkQuote() {
  const keys = Object.keys(quotedServices);

  if (keys.length === 0) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const emptyUtterance = new SpeechSynthesisUtterance("No has agregado ningún servicio a la cotización aún.");
      emptyUtterance.lang = 'es-ES';
      window.speechSynthesis.speak(emptyUtterance);
    }
    return;
  }

  let text = "El resumen de tu cotización es el siguiente: ";
  let grandTotal = 0;

  keys.forEach(key => {
    const sData = quotedServices[key];
    const conf = servicesConfig[key];

    const m2Subtotal = sData.m2 * conf.pricePerM2;
    const extrasSubtotal = sData.selectedExtras.reduce((sum, item) => sum + item.price, 0);
    const serviceTotal = conf.basePrice + m2Subtotal + extrasSubtotal;

    grandTotal += serviceTotal;

    text += `Para ${conf.title}, ${sData.m2} metros cuadrados. `;

    if (sData.selectedExtras.length > 0) {
      text += `Incluye los extras de: ${sData.selectedExtras.map(e => e.name).join(', ')}. `;
    }

    text += `Subtotal de ${serviceTotal} bolivianos. `;
  });

  text += `El monto total estimado es de ${grandTotal} bolivianos.`;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// LÓGICA DEL SLIDER SUPERIOR (banner1.png - banner4.png)
const sliderImages = [
  'img/banner1.png',
  'img/banner2.png',
  'img/banner3.png',
  'img/banner4.png'
];
let currentSlide = 1; // Inicia en banner2.png

function updateSlideUI() {
  const imgEl = document.getElementById('mainSliderImg');
  if (imgEl) imgEl.src = sliderImages[currentSlide];

  sliderImages.forEach((_, idx) => {
    const btn = document.getElementById(`slideBtn-${idx}`);
    if (btn) {
      btn.className = (idx === currentSlide) 
        ? 'w-6 h-6 text-xs font-bold rounded text-white bg-blue-600'
        : 'w-6 h-6 text-xs font-bold rounded text-white bg-slate-800 hover:bg-slate-700';
    }
  });
}

function setSlide(index) {
  currentSlide = index;
  updateSlideUI();
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % sliderImages.length;
  updateSlideUI();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + sliderImages.length) % sliderImages.length;
  updateSlideUI();
}

// Rotación automática cada 5s
setInterval(nextSlide, 5000);

// Cargar al inicio
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  calculateTotal();
  updateSlideUI();
});