// ==========================================
// CONFIGURACIÓN DE SERVICIOS Y PRECIOS BASE
// ==========================================
const SERVICIOS_DATA = {
  Alfombras: {
    title: "Lavado Profesional de Alfombra Fija",
    description: "Limpieza profunda a domicilio, desinfección y eliminación de manchas.",
    img: "/img/banner1.png",
    precioM2: 15,
    minimo: 80
  },
  AlfombraSuelta: {
    title: "Lavado de Alfombra Suelta (En Taller)",
    description: "Recojo a domicilio, lavado integral en taller y entrega en 3 a 5 días hábiles.",
    img: "/img/banner2.png",
    precioM2: 18,
    minimo: 90
  },
  Oficinas: {
    title: "Limpieza Integral de Oficinas",
    description: "Mantenimiento, desinfección de escritorios, pisos y áreas comunes.",
    img: "/img/banner3.png",
    precioM2: 12,
    minimo: 100
  },
  Casas: {
    title: "Limpieza de Casas y Departamentos",
    description: "Limpieza profunda de cocinas, baños, dormitorios y salas de estar.",
    img: "/img/banner4.png",
    precioM2: 10,
    minimo: 120
  }
};

// Servicio actualmente activo
let servicioSeleccionado = 'Alfombras';

// Precios unitarios para los extras
const PRECIOS_EXTRAS = {
  vidrios: 12,
  sillas: 7,
  sofas: { 1: 40, 2: 80, 3: 120, 4: 160, 5: 200 },
  piso: 14,
  cocina: 150
};

// ==========================================
// CONTROL DE PESTAÑAS Y SLIDER BASE (1 Y 2)
// ==========================================

function selectServiceTab(tipo) {
  if (!SERVICIOS_DATA[tipo]) return;
  
  servicioSeleccionado = tipo;

  const listaServicios = ['Alfombras', 'AlfombraSuelta', 'Oficinas', 'Casas'];
  listaServicios.forEach(s => {
    const btn = document.getElementById(`btn-${s}`);
    if (btn) {
      if (s === tipo) {
        btn.classList.add('border-emerald-600', 'bg-emerald-50', 'ring-2', 'ring-emerald-500');
        btn.classList.remove('border-gray-200');
      } else {
        btn.classList.remove('border-emerald-600', 'bg-emerald-50', 'ring-2', 'ring-emerald-500');
        btn.classList.add('border-gray-200');
      }
    }
  });

  const data = SERVICIOS_DATA[tipo];
  const imgEl = document.getElementById('serviceImage');
  const titleEl = document.getElementById('serviceTitle');
  const descEl = document.getElementById('serviceDescription');

  if (imgEl) imgEl.src = data.img;
  if (titleEl) titleEl.innerText = data.title;
  if (descEl) descEl.innerText = data.description;

  recalculoTotalCotizacion();
}

// Corrección: Avanzar estrictamente de 1 en 1 en lugar de delta * 5
function changeM2Step(delta) {
  const slider = document.getElementById('m2Slider');
  if (!slider) return;

  let val = parseInt(slider.value) + delta;
  let min = parseInt(slider.min);
  let max = parseInt(slider.max);

  if (val >= min && val <= max) {
    slider.value = val;
    onSliderChange();
  }
}

function onSliderChange() {
  const slider = document.getElementById('m2Slider');
  const label = document.getElementById('m2Value');

  if (slider && label) {
    label.innerText = `${slider.value} m²`;
  }

  recalculoTotalCotizacion();
}

// ==========================================
// CONTROL DE EXTRAS OPCIONALES (SECCIÓN 3)
// ==========================================

function toggleExtra(tipo) {
  const checkbox = document.getElementById(`check-${tipo}`);
  const panel = document.getElementById(`panel-${tipo}`);
  
  if (checkbox && panel) {
    if (checkbox.checked) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }
  updateExtraValue(tipo);
  recalculoTotalCotizacion();
}

function changeExtraQty(tipo, delta) {
  const slider = document.getElementById(`range-${tipo}`);
  if (!slider) return;
  
  let val = parseInt(slider.value) + delta;
  let min = parseInt(slider.min);
  let max = parseInt(slider.max);
  
  if (val >= min && val <= max) {
    slider.value = val;
    updateExtraValue(tipo);
  }
}

function updateExtraValue(tipo) {
  const slider = document.getElementById(`range-${tipo}`);
  const label = document.getElementById(`label-${tipo}`);
  if (!slider || !label) return;

  const val = parseInt(slider.value);

  if (tipo === 'vidrios') {
    label.innerText = `${val} vent. (Bs ${val * PRECIOS_EXTRAS.vidrios})`;
  } else if (tipo === 'sillas') {
    label.innerText = `${val} unid. (Bs ${val * PRECIOS_EXTRAS.sillas})`;
  } else if (tipo === 'sofas') {
    const textoCuerpos = { 1: '1 Cuerpo', 2: '2 Cuerpos', 3: '3 Cuerpos', 4: '4 Cuerpos', 5: '5 Cuerpos' };
    const costo = PRECIOS_EXTRAS.sofas[val] || (val * 40);
    label.innerText = `${textoCuerpos[val] || val + ' Cuerpos'} (Bs ${costo})`;
  } else if (tipo === 'piso') {
    label.innerText = `${val} m² (Bs ${val * PRECIOS_EXTRAS.piso})`;
  }

  recalculoTotalCotizacion();
}

// ==========================================
// CÁLCULO TOTAL Y ACTUALIZACIÓN EN VIVO
// ==========================================

function recalculoTotalCotizacion() {
  const m2Slider = document.getElementById('m2Slider');
  const m2 = m2Slider ? parseInt(m2Slider.value) : 15;
  
  const datosServicio = SERVICIOS_DATA[servicioSeleccionado];
  let subtotalServicio = m2 * datosServicio.precioM2;

  if (subtotalServicio < datosServicio.minimo) {
    subtotalServicio = datosServicio.minimo;
  }

  // Actualizar etiqueta del subtotal individual de m2 en la columna izquierda
  const m2SubtotalEl = document.getElementById('m2Subtotal');
  if (m2SubtotalEl) {
    m2SubtotalEl.innerText = `(Bs ${subtotalServicio})`;
  }

  let totalExtras = 0;
  let listaResumenHTML = `
    <div class="border-b border-slate-700 pb-3 mb-3 last:border-b-0">
      <div class="flex justify-between items-start font-bold text-emerald-400 text-xs mb-0.5">
        <span>${datosServicio.title}</span>
        <span class="text-emerald-400 font-extrabold">Bs ${subtotalServicio}</span>
      </div>
      <div class="text-[10px] text-gray-400 mb-1">Superficie: ${m2} m²</div>
  `;

  let extrasCount = 0;

  if (document.getElementById('check-vidrios')?.checked) {
    const cant = parseInt(document.getElementById('range-vidrios').value);
    const costo = cant * PRECIOS_EXTRAS.vidrios;
    totalExtras += costo;
    extrasCount++;
    listaResumenHTML += `
      <div class="text-[11px] text-gray-300 flex justify-between pt-1">
        <span>+ Vidrios (${cant} vent.)</span>
        <span class="font-medium text-gray-200">Bs ${costo}</span>
      </div>`;
  }

  if (document.getElementById('check-sillas')?.checked) {
    const cant = parseInt(document.getElementById('range-sillas').value);
    const costo = cant * PRECIOS_EXTRAS.sillas;
    totalExtras += costo;
    extrasCount++;
    listaResumenHTML += `
      <div class="text-[11px] text-gray-300 flex justify-between pt-1">
        <span>+ Sillas (${cant} unid.)</span>
        <span class="font-medium text-gray-200">Bs ${costo}</span>
      </div>`;
  }

  if (document.getElementById('check-sofas')?.checked) {
    const cant = parseInt(document.getElementById('range-sofas').value);
    const costo = PRECIOS_EXTRAS.sofas[cant] || (cant * 40);
    totalExtras += costo;
    extrasCount++;
    listaResumenHTML += `
      <div class="text-[11px] text-gray-300 flex justify-between pt-1">
        <span>+ Sofá (${cant} cuerpos)</span>
        <span class="font-medium text-gray-200">Bs ${costo}</span>
      </div>`;
  }

  if (document.getElementById('check-piso')?.checked) {
    const m2Piso = parseInt(document.getElementById('range-piso').value);
    const costo = m2Piso * PRECIOS_EXTRAS.piso;
    totalExtras += costo;
    extrasCount++;
    listaResumenHTML += `
      <div class="text-[11px] text-gray-300 flex justify-between pt-1">
        <span>+ Lustrado Piso (${m2Piso} m²)</span>
        <span class="font-medium text-gray-200">Bs ${costo}</span>
      </div>`;
  }

  if (document.getElementById('check-cocina')?.checked) {
    totalExtras += PRECIOS_EXTRAS.cocina;
    extrasCount++;
    listaResumenHTML += `
      <div class="text-[11px] text-gray-300 flex justify-between pt-1">
        <span>+ Limpieza Profunda de Cocina</span>
        <span class="font-medium text-gray-200">Bs ${PRECIOS_EXTRAS.cocina}</span>
      </div>`;
  }

  listaResumenHTML += `</div>`;

  const granTotal = subtotalServicio + totalExtras;
  const breakdownEl = document.getElementById('servicesBreakdown');
  const summaryTotalEl = document.getElementById('summaryTotal');

  if (breakdownEl) breakdownEl.innerHTML = listaResumenHTML;
  if (summaryTotalEl) summaryTotalEl.innerText = `Bs ${granTotal}`;
}

// ==========================================
// FUNCIONES DE RESERVA DE WHATSAPP Y VOZ
// ==========================================

function sendToWhatsApp() {
  const datosServicio = SERVICIOS_DATA[servicioSeleccionado];
  const m2 = parseInt(document.getElementById('m2Slider').value);
  
  let subtotalServicio = m2 * datosServicio.precioM2;
  if (subtotalServicio < datosServicio.minimo) subtotalServicio = datosServicio.minimo;

  let message = "Hola *LIM-BOLIVIA*, deseo solicitar la reserva del siguiente servicio:\n\n";
  message += `📌 *${datosServicio.title}*\n`;
  message += `• Superficie: ${m2} m² (Bs ${subtotalServicio})\n`;

  let totalExtras = 0;

  if (document.getElementById('check-vidrios')?.checked) {
    const cant = parseInt(document.getElementById('range-vidrios').value);
    const costo = cant * PRECIOS_EXTRAS.vidrios;
    totalExtras += costo;
    message += `  + Vidrios: ${cant} vent. (Bs ${costo})\n`;
  }

  if (document.getElementById('check-sillas')?.checked) {
    const cant = parseInt(document.getElementById('range-sillas').value);
    const costo = cant * PRECIOS_EXTRAS.sillas;
    totalExtras += costo;
    message += `  + Sillas: ${cant} unid. (Bs ${costo})\n`;
  }

  if (document.getElementById('check-sofas')?.checked) {
    const cant = parseInt(document.getElementById('range-sofas').value);
    const costo = PRECIOS_EXTRAS.sofas[cant] || (cant * 40);
    totalExtras += costo;
    message += `  + Sofá: ${cant} cuerpos (Bs ${costo})\n`;
  }

  if (document.getElementById('check-piso')?.checked) {
    const m2Piso = parseInt(document.getElementById('range-piso').value);
    const costo = m2Piso * PRECIOS_EXTRAS.piso;
    totalExtras += costo;
    message += `  + Lustrado de Piso: ${m2Piso} m² (Bs ${costo})\n`;
  }

  if (document.getElementById('check-cocina')?.checked) {
    totalExtras += PRECIOS_EXTRAS.cocina;
    message += `  + Limpieza de Cocina (Bs ${PRECIOS_EXTRAS.cocina})\n`;
  }

  const grandTotal = subtotalServicio + totalExtras;
  message += `\n💰 *TOTAL ESTIMADO: Bs ${grandTotal}*\n\n`;
  message += "Quedo a la espera de su confirmación. ¡Muchas gracias!";

  const phoneNumber = "59171506930";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank');
}

function talkQuote() {
  window.speechSynthesis.cancel(); // Cancelar locuciones previas

  const datosServicio = SERVICIOS_DATA[servicioSeleccionado];
  const m2 = parseInt(document.getElementById('m2Slider').value);
  
  let subtotalServicio = m2 * datosServicio.precioM2;
  if (subtotalServicio < datosServicio.minimo) subtotalServicio = datosServicio.minimo;

  let text = `Su cotización en Lim Bolivia para ${datosServicio.title} por ${m2} metros cuadrados es de ${subtotalServicio} bolivianos. `;
  let totalExtras = 0;

  if (document.getElementById('check-vidrios')?.checked) {
    const cant = parseInt(document.getElementById('range-vidrios').value);
    const costo = cant * PRECIOS_EXTRAS.vidrios;
    totalExtras += costo;
    text += `Incluye lavado de ${cant} ventanas por ${costo} bolivianos. `;
  }

  if (document.getElementById('check-sillas')?.checked) {
    const cant = parseInt(document.getElementById('range-sillas').value);
    const costo = cant * PRECIOS_EXTRAS.sillas;
    totalExtras += costo;
    text += `Incluye ${cant} sillas por ${costo} bolivianos. `;
  }

  if (document.getElementById('check-sofas')?.checked) {
    const cant = parseInt(document.getElementById('range-sofas').value);
    const costo = PRECIOS_EXTRAS.sofas[cant] || (cant * 40);
    totalExtras += costo;
    text += `Incluye sofá de ${cant} cuerpos por ${costo} bolivianos. `;
  }

  if (document.getElementById('check-piso')?.checked) {
    const m2Piso = parseInt(document.getElementById('range-piso').value);
    const costo = m2Piso * PRECIOS_EXTRAS.piso;
    totalExtras += costo;
    text += `Incluye lustrado de ${m2Piso} metros cuadrados de piso por ${costo} bolivianos. `;
  }

  if (document.getElementById('check-cocina')?.checked) {
    totalExtras += PRECIOS_EXTRAS.cocina;
    text += `Incluye limpieza profunda de cocina por ${PRECIOS_EXTRAS.cocina} bolivianos. `;
  }

  const grandTotal = subtotalServicio + totalExtras;
  text += `El monto total estimado es de ${grandTotal} bolivianos.`;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.95;

  window.speechSynthesis.speak(utterance);
}

// ==========================================
// AUTO-ROTACIÓN DEL CARRUSEL (HTML ACTUAL)
// ==========================================
const BANNER_IMAGES = [
  "/img/banner1.png",
  "/img/banner2.png",
  "/img/banner3.png",
  "/img/banner4.png"
];

let currentSlide = 0;
let autoSlideInterval = null;

function updateSliderUI() {
  const imgEl = document.getElementById('mainSliderImg');
  if (imgEl) {
    imgEl.src = BANNER_IMAGES[currentSlide];
  }

  BANNER_IMAGES.forEach((_, idx) => {
    const btn = document.getElementById(`slideBtn-${idx}`);
    if (btn) {
      if (idx === currentSlide) {
        btn.className = "w-6 h-6 text-xs font-bold rounded text-white bg-blue-600";
      } else {
        btn.className = "w-6 h-6 text-xs font-bold rounded text-white bg-slate-800 hover:bg-slate-700";
      }
    }
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % BANNER_IMAGES.length;
  updateSliderUI();
  resetAutoSlide();
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length;
  updateSliderUI();
  resetAutoSlide();
}

function setSlide(index) {
  currentSlide = index;
  updateSliderUI();
  resetAutoSlide();
}

function startAutoSlide() {
  if (autoSlideInterval) clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % BANNER_IMAGES.length;
    updateSliderUI();
  }, 4000);
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

// ==========================================
// INICIALIZACIÓN ÚNICA DE LA PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  selectServiceTab('Alfombras');
  updateSliderUI();
  startAutoSlide();
});