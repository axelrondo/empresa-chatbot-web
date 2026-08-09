
      // Lógica Slider Banner con Auto-play
      const slides = ["/img/banner1.png", "/img/banner2.png", "/img/asistente.png", "/img/banner1.png"];
      let currentSlide = 0;
      let slideTimer = null;

      function updateSlideUI() {
        const img = document.getElementById('mainSliderImg');
        if (img) img.src = slides[currentSlide];
        for (let i = 0; i < 4; i++) {
          const btn = document.getElementById(`slideBtn-${i}`);
          if (btn) {
            btn.className = i === currentSlide
              ? "w-6 h-6 text-xs font-bold rounded text-white bg-blue-600"
              : "w-6 h-6 text-xs font-bold rounded text-white bg-slate-800 hover:bg-slate-700";
          }
        }
      }

      function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlideUI();
      }

      function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlideUI();
      }

      function setSlide(index) {
        currentSlide = index;
        updateSlideUI();
        resetSlideTimer();
      }

      function startSlideTimer() {
        if (slideTimer) clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, 4000);
      }

      function resetSlideTimer() {
        startSlideTimer();
      }

      // Catálogo Data
      const catalogData = [
        {
          id: "sector1",
          nombre: "Aspiradoras e Hidros",
          icon: "fa-wind",
          productos: [
            { id: 1, nombre: "Aspiradora Industrial 30L", precio: "Bs 1,200", garantia: "12 Meses de Garantía", desc: "Aspiradora de alto rendimiento ideal para uso comercial e industrial.", specs: ["Tanque de 30L en acero inoxidable", "Motor doble turbina 1200W", "Filtro HEPA lavable"], imgs: ["/img/banner1.png", "/img/banner2.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 2, nombre: "Hidrolavadora 180 Bar", precio: "Bs 2,450", garantia: "6 Meses de Garantía", desc: "Hidrolavadora de agua fría con sistema de apagado automático.", specs: ["Presión máxima: 180 Bar", "Manguera de 10 metros", "Bomba axial de aluminio"], imgs: ["/img/banner2.png", "/img/banner1.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 3, nombre: "Aspiradora Polvo/Agua 60L", precio: "Bs 2,100", garantia: "12 Meses de Garantía", desc: "Equipo de doble motor para grandes superficies y succión de líquidos pesados.", specs: ["Capacidad 60 Litros", "Motor dual de 2400W total", "Chasis con ruedas de alto impacto"], imgs: ["/img/banner1.png", "/img/banner2.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 4, nombre: "Hidrolavadora Trifásica 250 Bar", precio: "Bs 4,800", garantia: "12 Meses de Garantía", desc: "Lavadora a alta presión para trabajo continuo en lavaderos y construcción.", specs: ["Presión máxima: 250 Bar", "Cabezal de latón con pistones cerámicos", "Manguera reforzada de malla de acero"], imgs: ["/img/banner2.png", "/img/banner1.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 5, nombre: "Lava-Tapices Inyectora 15L", precio: "Bs 3,200", garantia: "12 Meses de Garantía", desc: "Sistema de inyección y extracción profunda para limpieza de alfombras y sofás.", specs: ["Bomba de inyección 4 Bar", "Motor de aspirado de alta velocidad", "Boquilla transparente para control de suciedad"], imgs: ["/img/banner1.png", "/img/banner2.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 6, nombre: "Aspiradora Mochila Ergonométrica", precio: "Bs 1,850", garantia: "6 Meses de Garantía", desc: "Diseñada para máxima movilidad en pasillos, cines y transporte público.", specs: ["Peso ultra liviano 4.5kg", "Filtro multietapa HEPA", "Arnés acolchado ajustable"], imgs: ["/img/banner2.png", "/img/banner1.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 7, nombre: "Hidrolavadora Autónoma a Gasolina", precio: "Bs 5,900", garantia: "12 Meses de Garantía", desc: "Equipo industrial con motor a combustión de 7 HP para lugares sin red eléctrica.", specs: ["Motor 7 HP 4 Tiempos", "Presión 220 Bar", "Estructura tubular con ruedas neumáticas"], imgs: ["/img/banner1.png", "/img/banner2.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 8, nombre: "Aspiradora Silenciosa Hospitalaria", precio: "Bs 1,950", garantia: "12 Meses de Garantía", desc: "Bajo nivel de ruido (<62 dB) diseñada para clínicas, hospitales y oficinas.", specs: ["Operación ultra silenciosa", "Filtrado antibacteriano", "Cable extensible de 12 metros"], imgs: ["/img/banner2.png", "/img/banner1.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 9, nombre: "Hidrolavadora de Agua Caliente", precio: "Bs 8,500", garantia: "12 Meses de Garantía", desc: "Caldera integrada para remoción instantánea de grasa y aceites pesados.", specs: ["Temperatura hasta 90°C", "Caldera a diésel de alta eficiencia", "Presión ajustable"], imgs: ["/img/banner1.png", "/img/banner2.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] },
            { id: 10, nombre: "Soplador Secador de Alfombras", precio: "Bs 1,400", garantia: "6 Meses de Garantía", desc: "Turbina de alta potencia para secado acelerado de pisos y tapicería.", specs: ["3 Velocidades de flujo de aire", "Carcasa de polietileno rotomolded", "Asa de transporte equilibrada"], imgs: ["/img/banner2.png", "/img/banner1.png", "/img/asistente.png", "/img/banner1.png", "/img/banner2.png"] }
          ]
        }
      ];

      const extraCats = [
        { name: "Químicos y Detergentes", icon: "fa-flask" },
        { name: "Utensilios y Mops", icon: "fa-broom" },
        { name: "Equipos de Desinfección", icon: "fa-spray-can-sparkles" },
        { name: "Maquinaria de Pisos", icon: "fa-gears" },
        { name: "Seguridad e Higiene", icon: "fa-shield-halved" },
        { name: "Consumibles y Papelería", icon: "fa-paperclip" },
        { name: "Carros de Limpieza", icon: "fa-cart-flatbed" },
        { name: "Limpieza de Vidrios", icon: "fa-window-maximize" },
        { name: "Tratamiento de Aire", icon: "fa-fan" }
      ];

      extraCats.forEach((cat, index) => {
        const catIdx = index + 2;
        const prods = [];
        for (let p = 1; p <= 10; p++) {
          prods.push({
            id: p,
            nombre: `${cat.name} Ítem ${p}`,
            precio: `Bs ${45 + p * 35}`,
            garantia: "Garantía de Calidad LIM-BOLIVIA",
            desc: `Producto profesional de la categoría ${cat.name}. Excelente durabilidad y rendimiento asegurado.`,
            specs: [`Calidad industrial garantizada`, `Rendimiento óptimo en uso continuo`, `Soporte técnico directo`],
            imgs: [
              `/img/banner1.png`,
              `/img/banner2.png`,
              `/img/asistente.png`,
              `/img/banner1.png`,
              `/img/banner2.png`
            ]
          });
        }
        catalogData.push({ id: `sector${catIdx}`, nombre: cat.name, icon: cat.icon, productos: prods });
      });

      let activeCatId = "sector1";

      function renderMenu() {
        const container = document.getElementById('categoryMenuContainer');
        if (!container) return;
        container.innerHTML = '';
        catalogData.forEach(cat => {
          const isSelected = cat.id === activeCatId;
          const btn = document.createElement('button');
          btn.className = `w-full text-left px-3.5 py-3 rounded-xl font-medium text-xs flex items-center justify-between transition-all ${isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-700 hover:bg-slate-200'}`;
          btn.onclick = () => selectCategory(cat.id);
          btn.innerHTML = `<span class="flex items-center gap-2.5 truncate"><i class="fa-solid ${cat.icon} text-sm"></i> ${cat.nombre}</span><i class="fa-solid fa-chevron-right text-[10px]"></i>`;
          container.appendChild(btn);
        });
      }

      function selectCategory(catId) {
        activeCatId = catId;
        renderMenu();
        renderProducts();
      }

      function renderProducts() {
        const category = catalogData.find(c => c.id === activeCatId);
        if (!category) return;

        const titleElem = document.getElementById('currentCatTitle');
        if (titleElem) titleElem.innerHTML = `<i class="fa-solid ${category.icon} text-emerald-600"></i> ${category.nombre}`;
        const grid = document.getElementById('productsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        category.productos.forEach(prod => {
          const card = document.createElement('div');
          card.className = "group border rounded-xl p-3 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between";
          card.innerHTML = `
            <div>
              <div class="aspect-square bg-slate-200 rounded-lg overflow-hidden mb-2">
                <img src="${prod.imgs[0]}" alt="${prod.nombre}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" onerror="this.onerror=null; this.src='https://via.placeholder.com/200?text=Producto';">
              </div>
              <h4 class="font-bold text-xs text-gray-800 line-clamp-1">${prod.nombre}</h4>
              <p class="text-[11px] text-gray-500 mt-1 line-clamp-2">${prod.desc}</p>
            </div>
            <div class="mt-3 pt-2 border-t flex items-center justify-between">
              <span class="font-black text-emerald-600 text-xs">${prod.precio}</span>
              <button class="btn-detail bg-slate-900 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded transition">
                Ver detalle
              </button>
            </div>
          `;
          card.querySelector('.btn-detail').onclick = () => openExtendedModal(prod);
          grid.appendChild(card);
        });
      }

      function openExtendedModal(product) {
        document.getElementById('extModalName').innerText = product.nombre;
        document.getElementById('extModalPrice').innerText = product.precio;
        document.getElementById('extModalGuarantee').innerText = product.garantia;
        document.getElementById('extModalDesc').innerText = product.desc;

        document.getElementById('extModalMainImg').src = product.imgs[0];
        document.getElementById('thumb1').src = product.imgs[0];
        document.getElementById('thumb2').src = product.imgs[1];
        document.getElementById('thumb3').src = product.imgs[2];
        document.getElementById('thumb4').src = product.imgs[3];
        document.getElementById('thumb5').src = product.imgs[4];

        const specsContainer = document.getElementById('extModalSpecs');
        specsContainer.innerHTML = '';
        product.specs.forEach(spec => {
          const li = document.createElement('li');
          li.innerText = `• ${spec}`;
          specsContainer.appendChild(li);
        });

        const numWhatsApp = "59171506930";
        const msgWsp = encodeURIComponent(`Hola LIM-BOLIVIA, me interesa reservar el equipo: ${product.nombre} (${product.precio}).`);
        document.getElementById('extModalWspLink').href = `https://wa.me/${numWhatsApp}?text=${msgWsp}`;

        document.getElementById('extModalAiBtn').onclick = function () {
          closeExtendedProductModal();
          if (typeof toggleChat === 'function') toggleChat();

          const userInput = document.getElementById('userInput');
          if (userInput) {
            userInput.value = `Quiero más información sobre el producto: ${product.nombre}`;
            if (typeof sendMessage === 'function') sendMessage();
          }
        };

        document.getElementById('extendedProductModal').classList.remove('hidden');
      }

      function changeModalMainImage(src) {
        if (src) document.getElementById('extModalMainImg').src = src;
      }

      function closeExtendedProductModal() {
        document.getElementById('extendedProductModal').classList.add('hidden');
      }