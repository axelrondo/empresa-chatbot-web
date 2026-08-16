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

// Modificar la función showView para usar loadSection
const originalShowView = window.showView;
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
};

// Precargar la primera vista (inicio) cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadSection('view-inicio');
});

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