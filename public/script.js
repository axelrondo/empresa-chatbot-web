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

window.showView = function(viewId) {
    console.log('📱 showView:', viewId);
    document.querySelectorAll('.view-section').forEach(function(v) {
        v.classList.add('hidden');
    });
    var target = document.getElementById(viewId);
    if (target) {
        target.classList.remove('hidden');
        if (viewId === 'sec-maquinarias') {
            setTimeout(function() { cargarMaquinarias('Todas'); }, 300);
        }
    }
    document.querySelectorAll('.dropdown-content').forEach(function(el) {
        el.classList.add('hidden');
    });
    window.scrollTo({ top: 80, behavior: 'smooth' });
};

window.closeModal = function(id) {
    var modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
};

// ==========================================
// 🟢 VERIFICAR AUTENTICACIÓN DE ADMIN
// ==========================================
window.checkAdminAuth = function() {
    console.log('🔑 ADMIN presionado');

    if (!supabaseClient) {
        alert('⚠️ Supabase no configurado.');
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

// ==========================================
// 🟢 LOGIN REAL CON SUPABASE
// ==========================================
window.handleAdminLogin = async function(e) {
    e.preventDefault();
    console.log('🔐 Intentando login...');

    var email = document.getElementById('adminEmail').value;
    var password = document.getElementById('adminPassword').value;
    var errorMsg = document.getElementById('loginErrorMsg');
    var btn = document.querySelector('#formAdminLogin button[type="submit"]');

    if (!supabaseClient) {
        alert('Error: Supabase no está configurado.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';

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
        alert('✅ ¡Login exitoso!');

    } catch (err) {
        console.error('❌ Error de login:', err);
        errorMsg.textContent = '❌ Error: ' + err.message;
        errorMsg.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket mr-2"></i> Iniciar Sesión';
    }
};

// ==========================================
// 🟢 SUBIR PRODUCTO CON MÚLTIPLES IMÁGENES
// ==========================================
window.handleMachineUpload = async function(e) {
    e.preventDefault();
    console.log('📤 Subiendo producto...');

    var btn = document.getElementById('btnSubmitMachine');
    var codigo = document.getElementById('machineCodigo').value;
    var nombre = document.getElementById('machineNombre').value;
    var descripcion = document.getElementById('machineDescripcion').value;
    var precio_bs = parseFloat(document.getElementById('machinePrecio').value);
    var categoria = document.getElementById('machineCategoria') ? document.getElementById('machineCategoria').value : 'MAQUINARIA';
    var fileInput = document.getElementById('machineImage');
    var files = fileInput.files;

    if (!supabaseClient) {
        alert('Error: Supabase no está configurado.');
        return;
    }

    if (!isAdminAuthenticated) {
        alert('⚠️ Debes iniciar sesión primero.');
        return;
    }

    if (!files || files.length === 0) {
        alert('⚠️ Por favor selecciona al menos una imagen.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';

    try {
        var imagenes_urls = [];
        
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var cleanName = file.name
                .replace(/[{}()\[\]]/g, '')
                .replace(/[^a-zA-Z0-9._-]/g, '_')
                .replace(/_+/g, '_');
            var filePath = 'equipos/' + Date.now() + '_' + i + '_' + cleanName;
            
            var uploadResult = await supabaseClient.storage
                .from('maquinarias')
                .upload(filePath, file);
                
            if (uploadResult.error) throw uploadResult.error;
            
            var urlResult = supabaseClient.storage
                .from('maquinarias')
                .getPublicUrl(filePath);
                
            imagenes_urls.push(urlResult.data.publicUrl);
        }

        var imagenes_json = JSON.stringify(imagenes_urls);
        
        var insertResult = await supabaseClient
            .from('maquinarias')
            .insert([{
                codigo: codigo,
                nombre: nombre,
                descripcion: descripcion,
                precio_bs: precio_bs,
                categoria: categoria,
                imagen_url: imagenes_urls[0] || '',
                imagenes_extra: imagenes_json
            }]);

        if (insertResult.error) throw insertResult.error;

        alert('✅ ¡Producto publicado con éxito! (' + imagenes_urls.length + ' imágenes)');
        document.getElementById('formUploadMachine').reset();
        closeModal('modalUploadMachine');
        setTimeout(function() { cargarMaquinarias('Todas'); }, 500);

    } catch (err) {
        console.error('❌ Error:', err);
        alert('❌ Error al publicar el producto: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-2"></i> Publicar Producto';
    }
};

// ==========================================
// 🟢 FILTRAR POR CATEGORÍA
// ==========================================
window.filtrarCategoria = function(categoria) {
    console.log('🔍 Filtrando por:', categoria);
    
    document.querySelectorAll('[id^="filtro"]').forEach(function(btn) {
        btn.classList.remove('bg-[#003366]', 'text-white');
        btn.classList.add('bg-slate-100', 'text-slate-700');
    });
    
    var btnActivo = document.getElementById('filtro' + categoria);
    if (btnActivo) {
        btnActivo.classList.remove('bg-slate-100', 'text-slate-700');
        btnActivo.classList.add('bg-[#003366]', 'text-white');
    }
    
    cargarMaquinarias(categoria);
};

// ==========================================
// 🟢 CARGAR PRODUCTOS CON MODAL HORIZONTAL
// ==========================================
function cargarMaquinarias(filtroCategoria) {
    console.log('📦 Cargando maquinarias...', filtroCategoria || 'Todas');

    var container = document.getElementById('machineryGrid');
    if (!container) {
        console.warn('⚠️ No se encontró machineryGrid');
        return;
    }

    if (!supabaseClient) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-amber-600 text-xs font-bold">
                ⚠️ Configura Supabase
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-400">
            <i class="fa-solid fa-spinner fa-spin text-3xl"></i>
            <p class="text-xs mt-3">Cargando catálogo...</p>
        </div>
    `;

    var query = supabaseClient.from('maquinarias').select('*');
    if (filtroCategoria && filtroCategoria !== 'Todas') {
        query = query.eq('categoria', filtroCategoria);
    }
    query = query.order('id', { ascending: false });

    query
        .then(function(result) {
            if (result.error) throw result.error;

            var products = result.data;

            if (!products || products.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12 text-gray-500">
                        <i class="fa-solid fa-box-open text-5xl text-gray-300 mb-4 block"></i>
                        <p class="text-sm font-medium">No hay productos</p>
                        <button onclick="checkAdminAuth()" class="mt-4 bg-[#003366] text-white text-xs font-bold px-4 py-2 rounded-lg">
                            <i class="fa-solid fa-plus mr-1"></i> Agregar Producto
                        </button>
                    </div>
                `;
                return;
            }

            var html = '';
            products.forEach(function(prod) {
                var modalId = 'productModal_' + prod.id;
                var precioOriginal = (parseFloat(prod.precio_bs) * 1.3).toFixed(2);
                var categoria = prod.categoria || 'MAQUINARIA';
                var iconoCategoria = categoria === 'MAQUINARIA' ? 'fa-industry' : 'fa-box';
                var colorCategoria = categoria === 'MAQUINARIA' ? 'bg-blue-600' : 'bg-purple-600';
                
                var imagenesExtra = [];
                try {
                    if (prod.imagenes_extra) {
                        imagenesExtra = JSON.parse(prod.imagenes_extra);
                    }
                } catch(e) {}
                
                if (imagenesExtra.length === 0 && prod.imagen_url) {
                    imagenesExtra = [prod.imagen_url];
                }

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
                            <span class="absolute bottom-3 left-3 ${colorCategoria} text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                                <i class="fa-solid ${iconoCategoria}"></i> ${categoria}
                            </span>
                        </div>
                        <div class="p-5 space-y-3 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 class="font-bold text-[#003366] text-lg leading-tight">${prod.nombre}</h3>
                                <p class="text-xs text-gray-600 leading-relaxed mt-1 line-clamp-3">${prod.descripcion || 'Sin descripción'}</p>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-2 mt-2">
                                <button onclick="openProductDetail(${prod.id}, '${modalId}')" 
                                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg text-center block transition shadow-md hover:shadow-lg">
                                    <i class="fa-solid fa-eye mr-1.5"></i> Ver detalles
                                </button>
                                <a href="https://wa.me/59171506930?text=${encodeURIComponent('Hola, deseo más información sobre: ' + prod.nombre + ' (Código: ' + (prod.codigo || 'N/A') + ')')}" 
                                    target="_blank" 
                                    class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg text-center block transition shadow-md hover:shadow-lg">
                                    <i class="fa-brands fa-whatsapp mr-1.5"></i> Consultar
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL DE DETALLE - HORIZONTAL CORREGIDO -->
                    <div id="${modalId}" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center hidden p-2 sm:p-4">
                        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-fade-in">
                            <div class="sticky top-0 bg-white z-10 flex justify-between items-center p-3 sm:p-4 border-b border-slate-200">
                                <div class="flex items-center gap-2 sm:gap-3">
                                    <span class="${colorCategoria} text-white text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                                        <i class="fa-solid ${iconoCategoria}"></i> ${categoria}
                                    </span>
                                    <h3 class="font-black text-[#003366] text-sm sm:text-lg uppercase">Detalle del Producto</h3>
                                </div>
                                <button onclick="closeModal('${modalId}')" class="text-slate-400 hover:text-slate-600 text-xl sm:text-2xl transition">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <div class="overflow-y-auto p-3 sm:p-6 md:p-8" style="max-height: calc(90vh - 70px);">
                                <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
                                    
                                    <div class="lg:w-1/2 space-y-3">
                                        <div class="bg-slate-100 rounded-xl overflow-hidden h-64 sm:h-80 lg:h-[420px]">
                                            <img src="${imagenesExtra[0] || prod.imagen_url}" alt="${prod.nombre}" 
                                                class="w-full h-full object-contain"
                                                onerror="this.src='https://via.placeholder.com/800x600/003366/FFFFFF?text=Sin+Imagen';">
                                        </div>
                                        <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                            ${imagenesExtra.slice(0, 6).map(function(img, idx) {
                                                return `
                                                    <div class="bg-slate-100 rounded-lg overflow-hidden h-16 sm:h-20 cursor-pointer border-2 ${idx === 0 ? 'border-blue-500' : 'border-transparent hover:border-blue-500'} transition" onclick="cambiarImagenPrincipal('${modalId}', '${img}')">
                                                        <img src="${img}" alt="Vista ${idx+1}" class="w-full h-full object-cover">
                                                    </div>
                                                `;
                                            }).join('')}
                                            ${Array.from({length: Math.max(0, 6 - imagenesExtra.length)}, function(_, idx) {
                                                return `
                                                    <div class="bg-slate-100 rounded-lg overflow-hidden h-16 sm:h-20 cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500 transition flex items-center justify-center text-xs text-gray-400">
                                                        <span class="text-center"><i class="fa-solid fa-plus text-xl sm:text-2xl block"></i>Repuesto</span>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                        <p class="text-[9px] sm:text-[10px] text-gray-400 text-center">* ${imagenesExtra.length} imágenes cargadas.</p>
                                    </div>

                                    <div class="lg:w-1/2 space-y-4">
                                        <div>
                                            <span class="inline-block bg-[#003366] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">${prod.codigo || 'N/A'}</span>
                                            <h2 class="text-xl sm:text-2xl md:text-3xl font-black text-[#003366] mt-2">${prod.nombre}</h2>
                                        </div>

                                        <div class="flex flex-wrap items-center gap-3 border-y border-slate-200 py-3">
                                            <span class="text-2xl sm:text-3xl font-black text-amber-600">Bs. ${parseFloat(prod.precio_bs).toFixed(2)}</span>
                                            <span class="text-xs text-gray-400 line-through">Bs. ${precioOriginal}</span>
                                            <span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">-30%</span>
                                        </div>

                                        <div>
                                            <h4 class="font-bold text-[#003366] text-xs sm:text-sm uppercase tracking-wider">Descripción</h4>
                                            <div class="mt-2 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
                                                <p class="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">${prod.descripcion || 'Sin descripción disponible.'}</p>
                                            </div>
                                        </div>

                                        <div class="bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-100">
                                            <h4 class="font-bold text-[#003366] text-xs uppercase tracking-wider flex items-center gap-2">
                                                <i class="fa-solid fa-gear text-amber-500"></i> Especificaciones
                                            </h4>
                                            <ul class="mt-2 space-y-1 text-xs text-gray-600">
                                                <li>• <strong>Código:</strong> ${prod.codigo || 'N/A'}</li>
                                                <li>• <strong>Modelo:</strong> ${prod.nombre}</li>
                                                <li>• <strong>Categoría:</strong> <span class="${colorCategoria} text-white text-[10px] font-bold px-2 py-0.5 rounded-full">${categoria}</span></li>
                                                <li>• <strong>Garantía:</strong> 1 año</li>
                                                <li>• <strong>Disponibilidad:</strong> <span class="text-emerald-600 font-bold">✅ En stock</span></li>
                                            </ul>
                                        </div>

                                        <div class="flex flex-col gap-2 pt-3 border-t border-slate-200">
                                            <a href="https://wa.me/59171506930?text=${encodeURIComponent('Hola, deseo más información sobre: ' + prod.nombre + ' (Código: ' + (prod.codigo || 'N/A') + ')')}" 
                                                target="_blank" 
                                                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 sm:py-3 rounded-xl text-center transition shadow-md hover:shadow-lg text-xs sm:text-sm">
                                                <i class="fa-brands fa-whatsapp mr-2"></i> Consultar por WhatsApp
                                            </a>
                                            
                                            <div id="adminActions_${prod.id}" class="flex gap-2 ${isAdminAuthenticated ? '' : 'hidden'}">
                                                <button onclick="editarProducto(${prod.id})" 
                                                    class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl text-center transition text-xs">
                                                    <i class="fa-solid fa-pencil mr-1"></i> Editar
                                                </button>
                                                <button onclick="eliminarProducto(${prod.id})" 
                                                    class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-center transition text-xs">
                                                    <i class="fa-solid fa-trash mr-1"></i> Eliminar
                                                </button>
                                            </div>
                                            
                                            <button onclick="closeModal('${modalId}')" 
                                                class="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-center transition text-xs sm:text-sm">
                                                <i class="fa-solid fa-xmark mr-2"></i> Cerrar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
            console.log('✅ ' + products.length + ' productos cargados');
        })
        .catch(function(err) {
            console.error('❌ Error:', err);
            container.innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500 text-xs">
                    ❌ Error: ${err.message}
                </div>
            `;
        });
}

// ==========================================
// 🟢 CAMBIAR IMAGEN PRINCIPAL EN EL MODAL
// ==========================================
function cambiarImagenPrincipal(modalId, nuevaImagen) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    var imgPrincipal = modal.querySelector('.lg\\:w-1\\/2 .bg-slate-100 img');
    if (imgPrincipal) {
        imgPrincipal.src = nuevaImagen;
    }
    var thumbnails = modal.querySelectorAll('.grid-cols-3 .border-2');
    thumbnails.forEach(function(thumb) {
        thumb.classList.remove('border-blue-500');
        thumb.classList.add('border-transparent');
        if (thumb.querySelector('img') && thumb.querySelector('img').src === nuevaImagen) {
            thumb.classList.remove('border-transparent');
            thumb.classList.add('border-blue-500');
        }
    });
}

// ==========================================
// 🟢 ABRIR MODAL DE DETALLE
// ==========================================
function openProductDetail(productId, modalId) {
    console.log('🔍 Abriendo detalle del producto:', productId);
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        var adminActions = document.getElementById('adminActions_' + productId);
        if (adminActions) {
            if (isAdminAuthenticated) {
                adminActions.classList.remove('hidden');
            } else {
                adminActions.classList.add('hidden');
            }
        }
    }
}

// ==========================================
// 🟢 ELIMINAR PRODUCTO
// ==========================================
function eliminarProducto(productId) {
    if (!isAdminAuthenticated) {
        alert('⚠️ Debes iniciar sesión como administrador.');
        return;
    }
    if (!confirm('⚠️ ¿Estás seguro de eliminar este producto?\nEsta acción no se puede deshacer.')) {
        return;
    }
    console.log('🗑️ Eliminando producto:', productId);
    
    supabaseClient
        .from('maquinarias')
        .select('imagen_url, imagenes_extra')
        .eq('id', productId)
        .single()
        .then(function(result) {
            if (result.error) throw result.error;
            var imagenes = [];
            if (result.data.imagen_url) imagenes.push(result.data.imagen_url);
            try {
                if (result.data.imagenes_extra) {
                    var extra = JSON.parse(result.data.imagenes_extra);
                    imagenes = imagenes.concat(extra);
                }
            } catch(e) {}
            
            var deletePromises = imagenes.map(function(url) {
                var path = url.split('/').pop();
                var fullPath = 'equipos/' + path;
                return supabaseClient.storage.from('maquinarias').remove([fullPath]);
            });
            
            return Promise.all(deletePromises).then(function() {
                return supabaseClient.from('maquinarias').delete().eq('id', productId);
            });
        })
        .then(function(result) {
            if (result.error) throw result.error;
            alert('✅ Producto eliminado correctamente.');
            cargarMaquinarias('Todas');
        })
        .catch(function(err) {
            console.error('❌ Error eliminando:', err);
            alert('❌ Error al eliminar: ' + err.message);
        });
}

// ==========================================
// 🟢 EDITAR PRODUCTO
// ==========================================
function editarProducto(productId) {
    if (!isAdminAuthenticated) {
        alert('⚠️ Debes iniciar sesión como administrador.');
        return;
    }
    console.log('✏️ Editando producto:', productId);
    
    supabaseClient
        .from('maquinarias')
        .select('*')
        .eq('id', productId)
        .single()
        .then(function(result) {
            if (result.error) throw result.error;
            var prod = result.data;
            
            document.getElementById('editProductId').value = prod.id;
            document.getElementById('editCodigo').value = prod.codigo || '';
            document.getElementById('editNombre').value = prod.nombre || '';
            document.getElementById('editDescripcion').value = prod.descripcion || '';
            document.getElementById('editPrecio').value = prod.precio_bs || '';
            document.getElementById('editCategoria').value = prod.categoria || 'MAQUINARIA';
            
            var imgPreview = document.getElementById('editImagePreview');
            if (imgPreview) {
                imgPreview.src = prod.imagen_url;
                imgPreview.classList.remove('hidden');
            }
            document.getElementById('modalEditProduct').classList.remove('hidden');
        })
        .catch(function(err) {
            console.error('❌ Error:', err);
            alert('❌ Error al cargar datos: ' + err.message);
        });
}

// ==========================================
// 🟢 GUARDAR EDICIÓN DE PRODUCTO
// ==========================================
function guardarEdicionProducto() {
    var id = document.getElementById('editProductId').value;
    var codigo = document.getElementById('editCodigo').value;
    var nombre = document.getElementById('editNombre').value;
    var descripcion = document.getElementById('editDescripcion').value;
    var precio_bs = parseFloat(document.getElementById('editPrecio').value);
    var categoria = document.getElementById('editCategoria').value;
    var fileInput = document.getElementById('editImage');
    var file = fileInput.files[0];
    
    if (!nombre || !precio_bs) {
        alert('⚠️ Nombre y precio son obligatorios.');
        return;
    }
    
    var btn = document.getElementById('btnSaveEdit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    
    var updateData = {
        codigo: codigo,
        nombre: nombre,
        descripcion: descripcion,
        precio_bs: precio_bs,
        categoria: categoria
    };
    
    if (file) {
        var cleanName = file.name
            .replace(/[{}()\[\]]/g, '')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_');
        var filePath = 'equipos/' + Date.now() + '_' + cleanName;
        
        supabaseClient.storage
            .from('maquinarias')
            .upload(filePath, file)
            .then(function(uploadResult) {
                if (uploadResult.error) throw uploadResult.error;
                var urlResult = supabaseClient.storage.from('maquinarias').getPublicUrl(filePath);
                updateData.imagen_url = urlResult.data.publicUrl;
                return supabaseClient.from('maquinarias').update(updateData).eq('id', id);
            })
            .then(function(updateResult) {
                if (updateResult.error) throw updateResult.error;
                alert('✅ Producto actualizado correctamente.');
                closeModal('modalEditProduct');
                cargarMaquinarias('Todas');
            })
            .catch(function(err) {
                console.error('❌ Error:', err);
                alert('❌ Error al actualizar: ' + err.message);
            })
            .finally(function() {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> Guardar Cambios';
            });
    } else {
        supabaseClient
            .from('maquinarias')
            .update(updateData)
            .eq('id', id)
            .then(function(updateResult) {
                if (updateResult.error) throw updateResult.error;
                alert('✅ Producto actualizado correctamente.');
                closeModal('modalEditProduct');
                cargarMaquinarias('Todas');
            })
            .catch(function(err) {
                console.error('❌ Error:', err);
                alert('❌ Error al actualizar: ' + err.message);
            })
            .finally(function() {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> Guardar Cambios';
            });
    }
}

// ==========================================
// CARRUSEL
// ==========================================
var slideImages = ['/img/banner1.png', '/img/banner2.png', '/img/banner3.png'];
var currentSlide = 0;

function updateSlide() {
    var img = document.getElementById('mainSliderImg');
    if (img) img.src = slideImages[currentSlide];
    updateIndicators();
}

window.nextSlide = function() {
    currentSlide = (currentSlide + 1) % slideImages.length;
    updateSlide();
};

window.prevSlide = function() {
    currentSlide = (currentSlide - 1 + slideImages.length) % slideImages.length;
    updateSlide();
};

function updateIndicators() {
    var container = document.getElementById('slideIndicatorsContainer');
    if (!container) return;
    container.innerHTML = '';
    slideImages.forEach(function(_, idx) {
        var dot = document.createElement('div');
        dot.className = 'h-2.5 rounded-full cursor-pointer transition-all duration-300 ' +
            (idx === currentSlide ? 'bg-amber-400 w-6' : 'bg-white/60 hover:bg-white w-2.5');
        dot.onclick = function() {
            currentSlide = idx;
            updateSlide();
        };
        container.appendChild(dot);
    });
}

setInterval(window.nextSlide, 5000);

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 WebApp iniciada');
    console.log('📦 Supabase:', supabaseClient ? '✅ Conectado' : '❌ No configurado');
    cargarMaquinarias('Todas');
});

document.addEventListener('click', function(e) {
    var dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(function(dd) {
        if (!dd.contains(e.target)) {
            var content = dd.querySelector('.dropdown-content');
            if (content) content.classList.add('hidden');
        }
    });
});

console.log('✅ JavaScript cargado');