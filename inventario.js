// ===== 📦 MÓDULO DE INVENTARIO - JALI BZAR =====
// Manejo de stock: disponible, apartado (pendiente) y vendido (pagado)

// ─────────────────────────────────────────────
// 📊 RENDERIZAR INVENTARIO
// ─────────────────────────────────────────────
function renderizarInventario() {
    const contenedor = document.getElementById('inventarioGrid');
    if (!contenedor) return;

    if (!state.inventario || state.inventario.length === 0) {
        contenedor.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #bbb;">
                <div style="font-size: 3rem; margin-bottom: 15px; color: #ddd;"><i class="fas fa-box-open"></i></div>
                <p style="font-size: 1.2rem; font-weight: 600; color: #ccc;">Sin productos en inventario</p>
                <p style="font-size: 0.95rem; color: #ddd; margin-top: 8px;">Presiona <strong>+ Agregar Producto</strong> para empezar</p>
            </div>`;
        actualizarResumenInventario();
        return;
    }

    contenedor.innerHTML = state.inventario.map(prod => {
        const disponible = calcularDisponible(prod);
        const pctVendido = prod.stockTotal > 0 ? Math.round((prod.vendido / prod.stockTotal) * 100) : 0;
        const pctApartado = prod.stockTotal > 0 ? Math.round((prod.apartado / prod.stockTotal) * 100) : 0;

        const badgeColor = disponible <= 0 ? '#ff6b6b' : disponible <= 3 ? '#ffa94d' : '#51cf66';
        const statusLabel = disponible <= 0
            ? '<i class="fas fa-times-circle"></i> Agotado'
            : disponible <= 3
                ? '<i class="fas fa-exclamation-circle"></i> Poco stock'
                : '<i class="fas fa-check-circle"></i> Disponible';

        return `
        <div class="inv-card" id="inv-card-${prod.id}">
            <div class="inv-card-img-wrap">
                ${prod.foto
                    ? `<img src="${prod.foto}" alt="${prod.nombre}" class="inv-card-img" onclick="verFotoProducto('${prod.id}')">`
                    : `<div class="inv-card-noimg"><i class="fas fa-image"></i></div>`}
                <span class="inv-badge-status" style="background:${badgeColor}">${statusLabel}</span>
            </div>
            <div class="inv-card-body">
                <h3 class="inv-card-nombre">${prod.nombre}</h3>
                ${(prod.talla || prod.color) ? `
                <div class="inv-badges-row">
                    ${prod.talla ? `<span class="inv-badge-dato"><i class="fas fa-ruler"></i> ${prod.talla}</span>` : ''}
                    ${prod.color ? `<span class="inv-badge-dato"><i class="fas fa-palette"></i> ${prod.color}</span>` : ''}
                </div>` : ''}
                ${prod.descripcion ? `<p class="inv-card-desc">${prod.descripcion}</p>` : ''}

                <div class="inv-precios-row">
                    <div class="inv-precio-item">
                        <span class="inv-precio-label">Precio venta</span>
                        <span class="inv-precio-valor venta">$${parseFloat(prod.precio).toFixed(2)}</span>
                    </div>
                    ${prod.costo > 0 ? `
                    <div class="inv-precio-item">
                        <span class="inv-precio-label">Costo</span>
                        <span class="inv-precio-valor costo">$${parseFloat(prod.costo).toFixed(2)}</span>
                    </div>
                    <div class="inv-precio-item">
                        <span class="inv-precio-label">Ganancia</span>
                        <span class="inv-precio-valor ganancia">$${(prod.precio - prod.costo).toFixed(2)} <em>${Math.round(((prod.precio - prod.costo) / prod.precio) * 100)}%</em></span>
                    </div>` : ''}
                </div>

                <div class="inv-stock-bar-wrap">
                    <div class="inv-stock-bar">
                        <div class="inv-bar-vendido" style="width:${pctVendido}%" title="Vendido"></div>
                        <div class="inv-bar-apartado" style="width:${pctApartado}%" title="Apartado"></div>
                    </div>
                    <div class="inv-stock-nums">
                        <span class="inv-num disponible" title="Disponibles"><i class="fas fa-box"></i> ${disponible}</span>
                        <span class="inv-num apartado" title="Apartados (pendiente de pago)"><i class="fas fa-lock"></i> ${prod.apartado}</span>
                        <span class="inv-num vendido" title="Ya vendidos (pagados)"><i class="fas fa-check"></i> ${prod.vendido}</span>
                        <span class="inv-num total" title="Stock total">Total: ${prod.stockTotal}</span>
                    </div>
                </div>

                <div class="inv-card-actions">
                    <button class="btn-inv-edit" onclick="editarProductoInventario(${prod.id})" title="Editar"><i class="fas fa-pencil-alt"></i> Editar</button>
                    <button class="btn-inv-delete" onclick="eliminarProductoInventario(${prod.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>`;
    }).join('');

    actualizarResumenInventario();
}

function calcularDisponible(prod) {
    return Math.max(0, (prod.stockTotal || 0) - (prod.apartado || 0) - (prod.vendido || 0));
}

function actualizarResumenInventario() {
    if (!state.inventario) return;
    const totalProductos = state.inventario.length;
    const totalApartado = state.inventario.reduce((s, p) => s + (p.apartado || 0), 0);
    const totalVendido = state.inventario.reduce((s, p) => s + (p.vendido || 0), 0);
    const totalDisponible = state.inventario.reduce((s, p) => s + calcularDisponible(p), 0);

    const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    el('invStatProductos', totalProductos);
    el('invStatDisponible', totalDisponible);
    el('invStatApartado', totalApartado);
    el('invStatVendido', totalVendido);
}

// ─────────────────────────────────────────────
// ➕ MODAL AGREGAR / EDITAR PRODUCTO
// ─────────────────────────────────────────────
let inventarioEnEdicion = null;

function abrirModalInventario(idProducto = null) {
    inventarioEnEdicion = idProducto;
    const modal = document.getElementById('modalInventario');
    const titulo = document.getElementById('tituloModalInventario');
    const form = document.getElementById('formInventario');

    form.reset();
    document.getElementById('invFotoPreview').style.display = 'none';
    document.getElementById('invFotoPreview').src = '';
    document.getElementById('invFotoBase64').value = '';

    if (idProducto) {
        const prod = state.inventario.find(p => p.id === idProducto);
        if (!prod) return;
        titulo.textContent = 'Editar Producto ✏️';
        document.getElementById('invNombre').value = prod.nombre;
        document.getElementById('invDescripcion').value = prod.descripcion || '';
        document.getElementById('invTalla').value = prod.talla || '';
        document.getElementById('invColor').value = prod.color || '';
        document.getElementById('invPrecio').value = prod.precio;
        document.getElementById('invCosto').value = prod.costo || '';
        document.getElementById('invStock').value = prod.stockTotal;
        if (prod.foto) {
            document.getElementById('invFotoBase64').value = prod.foto;
            document.getElementById('invFotoPreview').src = prod.foto;
            document.getElementById('invFotoPreview').style.display = 'block';
        }
    } else {
        titulo.textContent = 'Nuevo Producto';
    }

    modal.classList.add('active');
}

function cerrarModalInventario() {
    document.getElementById('modalInventario').classList.remove('active');
    inventarioEnEdicion = null;
}

function guardarProductoInventario(e) {
    e.preventDefault();
    const nombre = document.getElementById('invNombre').value.trim();
    const descripcion = document.getElementById('invDescripcion').value.trim();
    const talla = document.getElementById('invTalla').value.trim();
    const color = document.getElementById('invColor').value.trim();
    const precio = parseFloat(document.getElementById('invPrecio').value) || 0;
    const costo = parseFloat(document.getElementById('invCosto').value) || 0;
    const stockTotal = parseInt(document.getElementById('invStock').value) || 0;
    const foto = document.getElementById('invFotoBase64').value;

    if (!nombre || precio <= 0 || stockTotal <= 0) {
        alert('⚠️ Nombre, precio y stock son requeridos');
        return;
    }

    if (!state.inventario) state.inventario = [];

    if (inventarioEnEdicion) {
        const idx = state.inventario.findIndex(p => p.id === inventarioEnEdicion);
        if (idx !== -1) {
            state.inventario[idx] = {
                ...state.inventario[idx],
                nombre, descripcion, talla, color, precio, costo, stockTotal, foto
            };
            mostrarNotificacion('Producto actualizado', 'success');
        }
    } else {
        state.inventario.push({
            id: Date.now(),
            nombre, descripcion, talla, color, precio, costo, stockTotal,
            foto,
            apartado: 0,
            vendido: 0
        });
        mostrarNotificacion('Producto agregado al inventario', 'success');
    }

    guardarDatos();
    renderizarInventario();
    cerrarModalInventario();
    sonarExito();
}

function eliminarProductoInventario(id) {
    const prod = state.inventario.find(p => p.id === id);
    if (!prod) return;

    if (prod.apartado > 0) {
        alert(`⚠️ No puedes eliminar "${prod.nombre}" porque tiene ${prod.apartado} unidades apartadas en ventas activas.`);
        return;
    }

    if (!confirm(`¿Eliminar "${prod.nombre}" del inventario?`)) return;

    state.inventario = state.inventario.filter(p => p.id !== id);
    guardarDatos();
    renderizarInventario();
    mostrarNotificacion('Producto eliminado del inventario', 'info');
}

function editarProductoInventario(id) {
    abrirModalInventario(id);
}

// Ver foto grande
function verFotoProducto(id) {
    const prod = state.inventario.find(p => p.id == id);
    if (!prod || !prod.foto) return;
    const overlay = document.getElementById('fotoOverlay');
    document.getElementById('fotoOverlayImg').src = prod.foto;
    document.getElementById('fotoOverlayNombre').textContent = prod.nombre;
    overlay.style.display = 'flex';
}

// ─────────────────────────────────────────────
// 📷 MANEJO DE FOTO (base64)
// ─────────────────────────────────────────────
function manejarFotoInventario(input) {
    const file = input.files[0];
    if (!file) return;

    // Comprimir / redimensionar antes de guardar
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX = 400;
            let w = img.width, h = img.height;
            if (w > MAX || h > MAX) {
                if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                else { w = Math.round(w * MAX / h); h = MAX; }
            }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const base64 = canvas.toDataURL('image/jpeg', 0.75);
            document.getElementById('invFotoBase64').value = base64;
            document.getElementById('invFotoPreview').src = base64;
            document.getElementById('invFotoPreview').style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ─────────────────────────────────────────────
// 🔗 INTEGRACIÓN CON VENTAS — Actualizar stock
// ─────────────────────────────────────────────

/**
 * Llamar al GUARDAR una venta.
 * ventaAnterior: objeto venta antes de editar (null si es nueva)
 * ventaNueva: objeto venta que se está guardando
 */
function actualizarStockPorVenta(ventaAnterior, ventaNueva) {
    if (!state.inventario || state.inventario.length === 0) return;

    // Si hay venta anterior, primero revertimos su efecto en el stock
    if (ventaAnterior) {
        revertirStockVenta(ventaAnterior);
    }

    // Ahora aplicamos el efecto de la venta nueva
    aplicarStockVenta(ventaNueva);
}

/**
 * Llamar al ELIMINAR una venta.
 */
function revertirStockVenta(venta) {
    if (!venta || !venta.productos) return;
    venta.productos.forEach(prod => {
        if (!prod.inventarioId) return;
        const item = state.inventario.find(i => i.id === prod.inventarioId);
        if (!item) return;

        if (venta.pago === 'PAGADO') {
            item.vendido = Math.max(0, (item.vendido || 0) - prod.cantidad);
        } else {
            item.apartado = Math.max(0, (item.apartado || 0) - prod.cantidad);
        }
    });
}

/**
 * Aplica el efecto de una venta en el inventario.
 */
function aplicarStockVenta(venta) {
    if (!venta || !venta.productos) return;
    venta.productos.forEach(prod => {
        if (!prod.inventarioId) return;
        const item = state.inventario.find(i => i.id === prod.inventarioId);
        if (!item) return;

        if (venta.pago === 'PAGADO') {
            item.vendido = (item.vendido || 0) + prod.cantidad;
        } else {
            item.apartado = (item.apartado || 0) + prod.cantidad;
        }
    });
}

// ─────────────────────────────────────────────
// 🔍 BÚSQUEDA DE INVENTARIO EN MODAL DE VENTA
// ─────────────────────────────────────────────
let dropdownInvVisible = false;

function inicializarBuscadorInventario() {
    const input = document.getElementById('buscarInventarioVenta');
    const dropdown = document.getElementById('dropdownInventarioVenta');
    if (!input || !dropdown) return;

    input.addEventListener('input', function() {
        const termino = this.value.trim().toLowerCase();
        if (!termino || !state.inventario || state.inventario.length === 0) {
            dropdown.innerHTML = '';
            dropdown.classList.remove('show');
            dropdownInvVisible = false;
            return;
        }

        const resultados = state.inventario.filter(p =>
            p.nombre.toLowerCase().includes(termino)
        );

        if (resultados.length === 0) {
            dropdown.innerHTML = `<div class="inv-autocomplete-item no-results">😕 No encontrado en inventario</div>`;
        } else {
            dropdown.innerHTML = resultados.slice(0, 8).map(p => {
                const disp = calcularDisponible(p);
                return `
                <div class="inv-autocomplete-item" data-id="${p.id}" data-nombre="${p.nombre}" data-precio="${p.precio}" data-disponible="${disp}">
                    ${p.foto ? `<img src="${p.foto}" class="inv-autocomplete-img">` : '<span class="inv-autocomplete-noimg"><i class="fas fa-box"></i></span>'}
                    <div class="inv-autocomplete-info">
                        <strong>${p.nombre}</strong>
                        ${p.descripcion ? `<em class="inv-autocomplete-desc">${p.descripcion}</em>` : ''}
                        <span>$${parseFloat(p.precio).toFixed(2)} · Disponibles: <b style="color:${disp > 0 ? '#51cf66' : '#ff6b6b'}">${disp}</b></span>
                    </div>
                </div>`;
            }).join('');
        }

        dropdown.classList.add('show');
        dropdownInvVisible = true;
    });

    dropdown.addEventListener('click', function(e) {
        const item = e.target.closest('.inv-autocomplete-item');
        if (!item || item.classList.contains('no-results')) return;

        const id = parseInt(item.dataset.id);
        const nombre = item.dataset.nombre;
        const precio = parseFloat(item.dataset.precio);
        const disponible = parseInt(item.dataset.disponible);

        if (disponible <= 0) {
            mostrarNotificacion('⚠️ Sin stock disponible para ese producto', 'error');
            return;
        }

        // Llenar campos del formulario de producto
        document.getElementById('nombreProducto').value = nombre;
        const precioField = document.getElementById('precioProducto');
        precioField.value = precio.toFixed(2);
        // Animación verde para indicar que el precio se auto-llenó
        precioField.classList.add('precio-autofill');
        setTimeout(() => precioField.classList.remove('precio-autofill'), 1800);
        document.getElementById('cantidadProducto').value = 1;

        // Guardar el inventarioId para tracking
        document.getElementById('productoInventarioId').value = id;

        input.value = '';
        dropdown.classList.remove('show');
        dropdownInvVisible = false;

        // Focus en cantidad
        document.getElementById('cantidadProducto').focus();
        mostrarNotificacion(`📦 ${nombre} seleccionado del inventario`, 'success');
    });

    // Cerrar al click fuera
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
            dropdownInvVisible = false;
        }
    });
}

// ─────────────────────────────────────────────
// 🔎 FILTROS DE INVENTARIO
// ─────────────────────────────────────────────
function filtrarInventario() {
    const termino = document.getElementById('buscarInventario')?.value.trim().toLowerCase() || '';
    const filtro = document.getElementById('filtroStockInv')?.value || 'todos';

    if (!state.inventario) return;

    let lista = [...state.inventario];

    if (termino) {
        lista = lista.filter(p => p.nombre.toLowerCase().includes(termino) || (p.descripcion || '').toLowerCase().includes(termino));
    }

    if (filtro === 'disponible') {
        lista = lista.filter(p => calcularDisponible(p) > 0);
    } else if (filtro === 'agotado') {
        lista = lista.filter(p => calcularDisponible(p) <= 0);
    } else if (filtro === 'apartado') {
        lista = lista.filter(p => p.apartado > 0);
    }

    // Renderizar con lista filtrada (temporal)
    const inventarioOriginal = state.inventario;
    state.inventario = lista;
    renderizarInventario();
    state.inventario = inventarioOriginal;
}

// ─────────────────────────────────────────────
// 🚀 INICIALIZACIÓN
// ─────────────────────────────────────────────
function inicializarInventario() {
    if (!state.inventario) state.inventario = [];

    // Botón agregar
    const btnAgregar = document.getElementById('btnAgregarInventario');
    if (btnAgregar) btnAgregar.addEventListener('click', () => abrirModalInventario());

    // Form guardar
    const formInv = document.getElementById('formInventario');
    if (formInv) formInv.addEventListener('submit', guardarProductoInventario);

    // Cerrar modal
    const btnCerrarInv = document.getElementById('btnCerrarModalInventario');
    if (btnCerrarInv) btnCerrarInv.addEventListener('click', cerrarModalInventario);

    // Click fuera del modal
    const modalInv = document.getElementById('modalInventario');
    if (modalInv) {
        modalInv.addEventListener('click', e => {
            if (e.target === modalInv) cerrarModalInventario();
        });
    }

    // Foto input
    const fotoInput = document.getElementById('invFoto');
    if (fotoInput) fotoInput.addEventListener('change', () => manejarFotoInventario(fotoInput));

    // Búsqueda y filtro
    const buscarInv = document.getElementById('buscarInventario');
    if (buscarInv) buscarInv.addEventListener('input', filtrarInventario);
    const filtroInv = document.getElementById('filtroStockInv');
    if (filtroInv) filtroInv.addEventListener('change', filtrarInventario);

    // Overlay foto
    const overlay = document.getElementById('fotoOverlay');
    if (overlay) overlay.addEventListener('click', () => { overlay.style.display = 'none'; });

    // Buscador de inventario en modal de venta
    inicializarBuscadorInventario();

    renderizarInventario();
}
