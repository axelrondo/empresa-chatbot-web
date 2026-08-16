// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = 'https://hnoatmqybkwrloeitqkq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9Rnzjfp2r8yLN3Fiqecd6g_QQoPQ2I2';

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase inicializado');
} else {
    console.warn('⚠️ Supabase SDK no encontrado');
}

let isAdminAuthenticated = false;

// ==========================================
// FUNCIONES PRINCIPALES
// ==========================================

// Mostrar vista
window.showView = function(viewId) {
    console.log('📱 showView:', viewId);
    
    // Ocultar todas
    document.querySelectorAll('.view-section').forEach(function(v) {
        v.classList.add('hidden');
    });
    
    // Mostrar la seleccionada
    var target = document.getElementById(viewId);
    if (target) {
        target.classList.remove('hidden');
        if (viewId === 'sec-maquinarias') {
            setTimeout(cargarMaquinarias, 300);
        }
    }
    
    // Cerrar dropdowns
    document.querySelectorAll('.dropdown-content').forEach(function(el) {
        el.classList.add('hidden');
    });
    
    window.scrollTo({ top: 80, behavior: 'smooth' });
};

// Cerrar modal
window.closeModal = function(id) {
    console.log('🔒 Cerrando modal:', id);
    var modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
};

// Verificar autenticación de admin
window.checkAdminAuth = function() {
    console.log('🔑 ADMIN presionado');
    alert('✅ Botón ADMIN funciona!');
    
    if (!supabaseClient) {
        alert('⚠️ Supabase no configurado. Revisa las credenciales.');
        return;
    }
    
    if (isAdminAuthenticated) {
        var modal = document.getElementById('modalUploadMachine');
        if (modal) modal.classList.remove('hidden');
    } else {
        var modal = document.getElementById('modalAdminLogin');
        if (modal) modal.classList.remove('hidden');
    }
};

// Iniciar Sesión de Administrador
window.handleAdminLogin = async function(e) {
    e.preventDefault();
    console.log('🔐 Intentando login...');
    alert('🔐 Login intentando...');
    
    var email = document.getElementById('adminEmail').value;
    var password = document.getElementById('adminPassword').value;
    var errorMsg = document.getElementById('loginErrorMsg');

    if (!supabaseClient) {
        alert('Error: Supabase no está configurado.');
        return;
    }

    try {
        var result = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (result.error) throw result.error;

        isAdminAuthenticated = true;
        errorMsg.classList.add('hidden');
        closeModal('modalAdminLogin');
        
        var modal = document.getElementById('modalUploadMachine');
        if (modal) modal.classList.remove('hidden');
        
        console.log('✅ Admin autenticado correctamente');
        alert('✅ Login exitoso!');
    } catch (err) {
        console.error('❌ Error de login:', err);
        errorMsg.textContent = '❌ Error de autenticación: ' + err.message;
        errorMsg.classList.remove('hidden');
    }
};

// Subir nueva maquinaria
window.handleMachineUpload = async function(e) {
    e.preventDefault();
    console.log('📤 Subiendo producto...');
    alert('📤 Subiendo producto...');
    
    var btn = document.getElementById('btnSubmitMachine');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';

    var codigo = document.getElementById('machineCodigo').value;
    var nombre = document.getElementById('machineNombre').value;
    var descripcion = document.getElementById('machineDescripcion').value;
    var precio_bs = parseFloat(document.getElementById('machinePrecio').value);
    var fileInput = document.getElementById('machineImage');
    var file = fileInput.files[0];

    if (!supabaseClient) {
        alert('Error: Supabase no está configurado.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Publicar Producto';
        return;
    }

    if (!file) {
        alert('⚠️ Por favor selecciona una imagen.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Publicar Producto';
        return;
    }

    try {
        // 1. Subir imagen
        var filePath = 'equipos/' + Date.now() + '_' + file.name;
        var uploadResult = await supabaseClient.storage
            .from('maquinarias')
            .upload(filePath, file);

        if (uploadResult.error) throw uploadResult.error;

        // 2. Obtener URL pública
        var urlResult = supabaseClient.storage
            .from('maquinarias')
            .getPublicUrl(filePath);

        var imagen_url = urlResult.data.publicUrl;

        // 3. Insertar en la tabla
        var insertResult = await supabaseClient
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

        if (insertResult.error) throw insertResult.error;

        alert('✅ ¡Producto publicado con éxito!');
        document.getElementById('formUploadMachine').reset();
        closeModal('modalUploadMachine');
        
        setTimeout(cargarMaquinarias, 500);
        
    } catch (err) {
        console.error('❌ Error:', err);
        alert('❌ Error al publicar el producto: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Publicar Producto';
    }
};

// Cargar maquinarias
function cargarMaquinarias() {
    console.log('📦 Cargando maquinarias...');
    
    var container = document.getElementById('machineryGrid');
    if (!container) {
        console.warn('⚠️ No se encontró machineryGrid');
        return;
    }

    if (!supabaseClient) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-amber-600 text-xs font-bold">
                ⚠️ Configura Supabase en script.js
            </div>
        `;
        return;
    }
    
    supabaseClient
        .from('maquinarias')
        .select('*')
        .order('id', { ascending: false })
        .then(function(result) {
            if (result.error) throw result.error;
            
            var products = result.data;
            
            if (!products || products.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12 text-gray-500">
                        <i class="fa-solid fa-box-open text-5xl text-gray-300 mb-4 block"></i>
                        <p class="text-sm font-medium">No hay maquinaria publicada</p>
                        <button onclick="checkAdminAuth()" class="mt-4 bg-[#003366] text-white text-xs font-bold px-4 py-2 rounded-lg">
                            <i class="fa-solid fa-plus mr-1"></i> Agregar Producto
                        </button>
                    </div>
                `;
                return;
            }

            var html = '';
            products.forEach(function(prod) {
                html += `
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
                                <p class="text-xs text-gray-600 leading-relaxed mt-1">${prod.descripcion || 'Sin descripción'}</p>
                            </div>
                            <a href="https://wa.me/59171506930?text=${encodeURIComponent('Hola, deseo más información sobre la máquina: ' + prod.nombre + ' (Código: ' + (prod.codigo || 'N/A') + ')')}" 
                                target="_blank" 
                                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg text-center block transition shadow-md hover:shadow-lg mt-2">
                                <i class="fa-brands fa-whatsapp mr-1.5"></i> Consultar por WhatsApp
                            </a>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        })
        .catch(function(err) {
            console.error('❌ Error cargando maquinarias:', err);
            container.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500 text-xs">
                    ❌ Error: ${err.message}
                </div>
            `;
        });
}

// ==========================================
// CARRUSEL
// ==========================================
var slideImages = ['/img/banner1.png', '/img/banner2.png', '/img/banner3.png'];
var currentSlide = 0;

function updateSlide() {
    var img = document.getElementById('mainSliderImg');
    if (img) img.src = slideImages[currentSlide];
}

window.nextSlide = function() {
    currentSlide = (currentSlide + 1) % slideImages.length;
    updateSlide();
};

window.prevSlide = function() {
    currentSlide = (currentSlide - 1 + slideImages.length) % slideImages.length;
    updateSlide();
};

setInterval(window.nextSlide, 5000);

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LIM-BOLIVIA WebApp iniciada');
    console.log('📦 Supabase:', supabaseClient ? '✅ Conectado' : '❌ No configurado');
    
    // Mostrar Inicio
    var inicio = document.getElementById('view-inicio');
    if (inicio) inicio.classList.remove('hidden');
    
    // Cargar maquinarias (si existe)
    setTimeout(cargarMaquinarias, 500);
});

// Cerrar dropdowns
document.addEventListener('click', function(e) {
    var dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(function(dd) {
        if (!dd.contains(e.target)) {
            var content = dd.querySelector('.dropdown-content');
            if (content) content.classList.add('hidden');
        }
    });
});

console.log('✅ script.js cargado correctamente');