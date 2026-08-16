/* ==========================================
   0. CONFIGURACIÓN DE SUPABASE
   ========================================== */

// 🔑 CAMBIA ESTOS DATOS CON LOS TUYOS
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_DE_SUPABASE';

// Inicializar Supabase
const supabaseClient = window.supabase 
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

let isAdminAuthenticated = false;

/* ==========================================
   1. CARGA DINÁMICA DE SECCIONES
   ========================================== */

const SECTION_MAP = {
  'view-inicio': 'view-inicio',
  'view-mision-vision': 'view-mision-vision',
  'view-quienes-somos': 'view-quienes-somos',
  'view-principios': 'view-principios',
  'view-24horas': 'view-24horas',
  'view-alfombras-tapizados': 'view-alfombras-tapizados',
  'view-cotizador': 'view-cotizador',
  'sec-maquinarias': 'sec-maquinarias',
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

const sectionCache = new Map();

async function loadSection(viewId) {
  const sectionKey = SECTION_MAP[viewId];
  if (!sectionKey) {
    console.warn('Sección no encontrada:', viewId);
    return;
  }

  if (sectionCache.has(sectionKey)) {
    const content = sectionCache.get(sectionKey);
    const container = document.getElementById(viewId);
    if (container) {
      container.innerHTML = content;
      container.classList.remove('hidden');
      container.classList.add('animate-fade-in');
    }
    if (viewId === 'sec-maquinarias') {
      setTimeout(cargarMaquinarias, 300);
    }
    return;
  }

  try {
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
    
    if (viewId === 'sec-maquinarias') {
      setTimeout(cargarMaquinarias, 400);
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
  document.querySelectorAll('.view-section').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('animate-fade-in');
  });
  
  loadSection(viewId);
  
  document.querySelectorAll('.dropdown-content').forEach(el => el.classList.add('hidden'));
  window.scrollTo({ top: 80, behavior: 'smooth' });
};

/* ==========================================
   2. CARRUSEL
   ========================================== */

const slideImages = ['/img/banner1.png', '/img/banner2.png', '/img/banner3.png'];
let currentSlideIndex = 0;

function updateSlide() {
  const sliderImg = document.getElementById('mainSliderImg');
  if (sliderImg) {
    sliderImg.src = slideImages[currentSlideIndex];
  }
  updateIndicators();
}

window.nextSlide = function() {
  currentSlideIndex = (currentSlideIndex + 1) % slideImages.length;
  updateSlide();
};

window.prevSlide = function() {
  currentSlideIndex = (currentSlideIndex - 1 + slideImages.length) % slideImages.length;
  updateSlide();
};

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

setInterval(() => {
  const inicioSection = document.getElementById('view-inicio');
  if (inicioSection && !inicioSection.classList.contains('hidden')) {
    window.nextSlide();
  }
}, 5000);

/* ==========================================
   3. COTIZADOR (BÁSICO)
   ========================================== */

window.selectServiceTab = function(tab) {
  console.log('📋 Tab seleccionada:', tab);
};

/* ==========================================
   4. 🆕 GESTIÓN DE MAQUINARIA (SUPABASE)
   ========================================== */

// Cerrar modal
window.closeModal = function(id) {
  console.log('🔒 Cerrando modal:', id);
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
};

// Verificar autenticación de admin
window.checkAdminAuth = function() {
  console.log('🔑 Botón ADMIN presionado');
  
  if (!supabaseClient) {
    alert('⚠️ Error: Supabase no está configurado.\n\nRevisa las credenciales en script.js');
    return;
  }
  
  if (isAdminAuthenticated) {
    const modal = document.getElementById('modalUploadMachine');
    if (modal) {
      modal.classList.remove('hidden');
      console.log('✅ Modal de upload abierto');
    } else {
      alert('⚠️ No se encontró el modal de carga. Revisa el index.html');
    }
  } else {
    const modal = document.getElementById('modalAdminLogin');
    if (modal) {
      modal.classList.remove('hidden');
      console.log('✅ Modal de login abierto');
    } else {
      alert('⚠️ No se encontró el modal de login. Revisa el index.html');
    }
  }
};

// Iniciar Sesión de Administrador
window.handleAdminLogin = async function(e) {
  e.preventDefault();
  console.log('🔐 Intentando login...');
  
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;
  const errorMsg = document.getElementById('loginErrorMsg');

  if (!supabaseClient) {
    alert('Error: Supabase no está configurado.');
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    isAdminAuthenticated = true;
    errorMsg.classList.add('hidden');
    closeModal('modalAdminLogin');
    
    const modal = document.getElementById('modalUploadMachine');
    if (modal) modal.classList.remove('hidden');
    
    console.log('✅ Admin autenticado correctamente');
  } catch (err) {
    console.error('❌ Error de login:', err);
    errorMsg.textContent = "❌ Error de autenticación: " + err.message;
    errorMsg.classList.remove('hidden');
  }
};

// Subir nueva maquinaria
window.handleMachineUpload = async function(e) {
  e.preventDefault();
  console.log('📤 Subiendo producto...');
  
  const btn = document.getElementById('btnSubmitMachine');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Publicando...`;

  const codigo = document.getElementById('machineCodigo').value;
  const nombre = document.getElementById('machineNombre').value;
  const descripcion = document.getElementById('machineDescripcion').value;
  const precio_bs = parseFloat(document.getElementById('machinePrecio').value);
  const fileInput = document.getElementById('machineImage');
  const file = fileInput.files[0];

  if (!supabaseClient) {
    alert('Error: Supabase no está configurado.');
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Publicar Producto`;
    return;
  }

  if (!file) {
    alert('⚠️ Por favor selecciona una imagen.');
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Publicar Producto`;
    return;
  }

  try {
    // 1. Subir la imagen al bucket
    const filePath = `equipos/${Date.now()}_${file.name}`;
    console.log('📤 Subiendo imagen:', filePath);
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('maquinarias')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Obtener URL pública
    const { data: urlData } = supabaseClient.storage
      .from('maquinarias')
      .getPublicUrl(filePath);

    const imagen_url = urlData.publicUrl;
    console.log('✅ Imagen subida:', imagen_url);

    // 3. Insertar en la tabla
    const { error: insertError } = await supabaseClient
      .from('maquinarias')
      .insert([
        {
          codigo: codigo,
          nombre: nombre,
          descripcion: descripcion,
          precio_bs: precio_bs,
          imagen_url: imagen_url
        }
      ]);

    if (insertError) throw insertError;

    alert('✅ ¡Producto publicado con éxito!');
    document.getElementById('formUploadMachine').reset();
    closeModal('modalUploadMachine');
    
    // Recargar el catálogo
    setTimeout(cargarMaquinarias, 500);
    
  } catch (err) {
    console.error('❌ Error:', err);
    alert('❌ Error al publicar el producto: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Publicar Producto`;
  }
};

// Cargar y mostrar maquinarias desde Supabase
async function cargarMaquinarias() {
  console.log('📦 Cargando maquinarias...');
  
  const container = document.getElementById('machineryGrid');
  if (!container) {
    console.warn('⚠️ No se encontró el contenedor machineryGrid');
    return;
  }

  if (!supabaseClient) {
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-amber-600 text-xs font-bold">
        ⚠️ Por favor configura las credenciales de Supabase en script.js
        <br><span class="text-gray-400 text-[10px]">SUPABASE_URL y SUPABASE_ANON_KEY</span>
      </div>
    `;
    return;
  }
  
  try {
    const { data: products, error } = await supabaseClient
      .from('maquinarias')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-500">
          <i class="fa-solid fa-box-open text-5xl text-gray-300 mb-4 block"></i>
          <p class="text-sm font-medium">No hay maquinaria publicada en este momento.</p>
          <p class="text-xs text-gray-400 mt-1">El administrador puede agregar productos desde el panel de control.</p>
          <button onclick="checkAdminAuth()" class="mt-4 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold px-4 py-2 rounded-lg transition">
            <i class="fa-solid fa-plus mr-1"></i> Agregar Producto (Admin)
          </button>
        </div>
      `;
      return;
    }

    console.log(`✅ ${products.length} productos cargados`);

    container.innerHTML = products.map(prod => `
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
        <div class="h-52 bg-slate-100 overflow-hidden relative">
          <img src="${prod.imagen_url}" alt="${prod.nombre}" 
            class="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
            onerror="this.src='https://via.placeholder.com/400x300/003366/FFFFFF?text=Sin+Imagen';">
          <span class="absolute top-3 left-3 bg-[#003366] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md">
            ${prod.codigo || 'N/A'}
          </span>
          <span class="absolute top-3 right-3 bg-amber-500 text-slate-900 font-black text-sm px-3 py-1 rounded-lg shadow-md">
            Bs. ${parseFloat(prod.precio_bs).toFixed(2)}
          </span>
        </div>
        <div class="p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-[#003366] text-lg leading-tight">${prod.nombre}</h3>
            <p class="text-xs text-gray-600 leading-relaxed mt-1 line-clamp-3">${prod.descripcion || 'Sin descripción'}</p>
          </div>
          <a href="https://wa.me/59171506930?text=${encodeURIComponent('Hola, deseo más información sobre la máquina: ' + prod.nombre + ' (Código: ' + (prod.codigo || 'N/A') + ')')}" 
            target="_blank" 
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg text-center block transition shadow-md hover:shadow-lg mt-2">
            <i class="fa-brands fa-whatsapp mr-1.5"></i> Consultar por WhatsApp
          </a>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('❌ Error cargando maquinarias:', err);
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-red-500 text-xs">
        ❌ Error al cargar los productos: ${err.message}
        <br><span class="text-gray-400 text-[10px]">Verifica la conexión a Supabase</span>
      </div>
    `;
  }
}

/* ==========================================
   5. ASISTENTE IA (placeholder)
   ========================================== */

window.toggleChat = function() {
  alert('🤖 Asistente Virtual LIM-BOLIVIA\n\nPróximamente podrás chatear con nuestra IA.');
};

/* ==========================================
   6. INICIALIZACIÓN
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 LIM-BOLIVIA WebApp iniciada');
  console.log('📦 Supabase:', supabaseClient ? '✅ Conectado' : '❌ No configurado');
  
  showView('view-inicio');
  updateIndicators();
  
  // Verificar si los modales existen
  const loginModal = document.getElementById('modalAdminLogin');
  const uploadModal = document.getElementById('modalUploadMachine');
  
  if (loginModal) console.log('✅ Modal de login encontrado');
  else console.warn('⚠️ Modal de login NO encontrado en el DOM');
  
  if (uploadModal) console.log('✅ Modal de upload encontrado');
  else console.warn('⚠️ Modal de upload NO encontrado en el DOM');
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