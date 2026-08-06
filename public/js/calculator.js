// Precios unitarios de los extras
const PRECIOS_EXTRAS = {
  vidrios: 12, // Bs por ventana (interior y exterior)
  sillas: 7,   // Bs por silla
  sofas: { 1: 40, 2: 80, 3: 120 }, // Cuerpos -> Bs
  piso: 14,    // Bs por m²
  cocina: 150  // Precio fijo
};

// Activar o desactivar desplegable del extra
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

// Botones + y - para los extras
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

// Actualizar etiquetas de texto y recalcular suma total
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

// Función principal que suma el servicio base + extras marcados
function recalculoTotalCotizacion() {
  // 1. Obtener metros y cálculo base
  const m2Slider = document.getElementById('m2Slider');
  const m2 = m2Slider ? parseInt(m2Slider.value) : 15;
  
  let subtotalServicio = m2 * 15; // 15 Bs por m²
  if (subtotalServicio < 80) subtotalServicio = 80; // Mínimo cobrable de 80 Bs

  let totalExtras = 0;
  let listaResumenHTML = `<div class="text-xs space-y-1.5 mb-3 border-b border-slate-700 pb-2">
    <div class="flex justify-between font-bold text-emerald-400">
      <span>Servicio Base (${m2} m²)</span>
      <span>Bs ${subtotalServicio}</span>
    </div>
  </div>`;

  // 2. Sumar extras activos
  if (document.getElementById('check-vidrios')?.checked) {
    const cant = parseInt(document.getElementById('range-vidrios').value);
    const costo = cant * PRECIOS_EXTRAS.vidrios;
    totalExtras += costo;
    listaResumenHTML += `<div class="flex justify-between text-xs text-slate-300">
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

  // 3. Renderizar resultados finales
  const granTotal = subtotalServicio + totalExtras;
  
  const breakdownEl = document.getElementById('servicesBreakdown');
  const summaryTotalEl = document.getElementById('summaryTotal');

  if (breakdownEl) breakdownEl.innerHTML = listaResumenHTML;
  if (summaryTotalEl) summaryTotalEl.innerText = `Bs ${granTotal}`;
}