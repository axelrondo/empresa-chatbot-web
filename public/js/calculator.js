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
  sofas: { 1: 40, 2: 80, 3: 120 },
  piso: 14,
  cocina: 150
};

// ==========================================
// CONTROL DE PESTAÑAS Y SLIDER BASE (1 Y 2)
// ==========================================

// Cambiar servicio activo al hacer clic en las pestañas
function selectServiceTab(tipo) {
  if (!SERVICIOS_DATA[tipo]) return;
  
  servicioSeleccionado = tipo;

  // Actualizar estilos de los botones
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

  // Actualizar tarjeta de información (Imagen, Título y Descripción)
  const data = SERVICIOS_DATA[tipo];
  const imgEl = document.getElementById('serviceImage');
  const titleEl = document.getElementById('serviceTitle');
  const descEl = document.getElementById('serviceDescription');

  if (imgEl) imgEl.src = data.img;
  if (titleEl) titleEl.innerText = data.title;
  if (descEl) descEl.innerText = data.description;

  recalculoTotalCotizacion();
}

// Botones + y - para el slider principal de m²
function changeM2Step(delta) {
  const slider = document.getElementById('m2Slider');
  if (!slider) return;

  let val = parseInt(slider.value) + (delta * 5); // Aumenta o disminuye de 5 en 5
  let min = parseInt(slider.min);
  let max = parseInt(slider.max);

  if (val >= min && val <= max) {
    slider.value = val;
    onSliderChange();
  }
}

// Mover la barra de metros cuadrados
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
    label.innerText = `${val} Unid. (Bs ${val * PRECIOS_EXTRAS.vidrios})`;
  } else if (tipo === 'sillas') {
    label.innerText = `${val} Unid. (Bs ${val * PRECIOS_EXTRAS.sillas})`;
  } else if (tipo === 'sofas') {
    const textoCuerpos = { 1: '1 Cuerpo', 2: '2 Cuerpos', 3: '3 Cuerpos' };
    label.innerText = `${textoCuerpos[val]} (Bs ${PRECIOS_EXTRAS.sofas[val]})`;
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

  // Aplicar tarifa mínima si corresponde
  if (subtotalServicio < datosServicio.minimo) {
    subtotalServicio = datosServicio.minimo;
  }

  let totalExtras = 0;
  let listaResumenHTML = `
    <div class="text-xs space-y-1 pb-2 border-b border-slate-700">
      <div class="flex justify-between font-bold text-emerald-400">
        <span>${datosServicio.title}</span>
        <span>Bs ${subtotalServicio}</span>
      </div>
      <div class="text-[10px] text-gray-400">Superficie: ${m2} m²</div>
    </div>
  `;

  // Sumar Extras seleccionados
  if (document.getElementById('check-vidrios')?.checked) {
    const cant = parseInt(document.getElementById('range-vidrios').value);
    const costo = cant * PRECIOS_EXTRAS.vidrios;
    totalExtras += costo;
    listaResumenHTML += `<div class="flex justify-between text-xs text-slate-300 mt-1">
      <span>+ Vidrios (${cant} vent.)</span>
      <span>Bs ${costo}</span>
    </div>`;
  }

  if (document.getElementById('check-sillas')?.checked) {
    const cant = parseInt(document.getElementById('range-sillas').value);
    const costo = cant * PRECIOS_EXTRAS.sillas;
    totalExtras += costo;
    listaResumenHTML += `<div class="flex justify-between text-xs text-slate-300">
      <span>+ Sillas (${cant} unid.)</span>
      <span>Bs ${costo}</span>
    </div>`;
  }

  if (document.getElementById('check-sofas')?.checked) {
    const cant = parseInt(document.getElementById('range-sofas').value);
    const costo = PRECIOS_EXTRAS.sofas[cant];
    totalExtras += costo;
    listaResumenHTML += `<div class="flex justify-between text-xs text-slate-300">
      <span>+ Sofá (${cant} cuerpos)</span>
      <span>Bs ${costo}</span>
    </div>`;
  }

  if (document.getElementById('check-piso')?.checked) {
    const m2Piso = parseInt(document.getElementById('range-piso').value);
    const costo = m2Piso * PRECIOS_EXTRAS.piso;
    totalExtras += costo;
    listaResumenHTML += `<div class="flex justify-between text-xs text-slate-300">
      <span>+ Lustrado Piso (${m2Piso} m²)</span>
      <span>Bs ${costo}</span>
    </div>`;
  }

  if (document.getElementById('check-cocina')?.checked) {
    totalExtras += PRECIOS_EXTRAS.cocina;
    listaResumenHTML += `<div class="flex justify-between text-xs text-slate-300">
      <span>+ Limpieza de Cocina</span>
      <span>Bs ${PRECIOS_EXTRAS.cocina}</span>
    </div>`;
  }

  // Renderizar Total y Detalles
  const granTotal = subtotalServicio + totalExtras;
  const breakdownEl = document.getElementById('servicesBreakdown');
  const summaryTotalEl = document.getElementById('summaryTotal');

  if (breakdownEl) breakdownEl.innerHTML = listaResumenHTML;
  if (summaryTotalEl) summaryTotalEl.innerText = `Bs ${granTotal}`;
}

// Inicializar la primera pestaña al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  selectServiceTab('Alfombras');
});

// ==========================================
// AUTO-ROTACIÓN DEL CARRUSEL PRINCIPAL
// ==========================================
let currentSlide = 0;
const totalSlides = 4;
let autoSlideInterval = null;

function updateCarouselUI() {
  const container = document.getElementById('carouselSlides');
  if (container) {
    container.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  // Actualizar botones de estado (1, 2, 3, 4)
  const dots = document.querySelectorAll('.dot-btn');
  dots.forEach((dot, index) => {
    if (index === currentSlide) {
      dot.classList.remove('bg-gray-600');
      dot.classList.add('bg-emerald-600');
    } else {
      dot.classList.remove('bg-emerald-600');
      dot.classList.add('bg-gray-600');
    }
  });
}

function moveSlide(direction) {
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateCarouselUI();
  resetAutoSlide();
}

function setSlide(index) {
  currentSlide = index;
  updateCarouselUI();
  resetAutoSlide();
}

function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarouselUI();
  }, 4000); // Cambia de imagen cada 4 segundos
}

function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

// Iniciar carrusel al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  startAutoSlide();
});