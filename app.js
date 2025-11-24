// ===== SISTEMA JALI BZAR - CÓDIGO COMPLETO =====

// ===== SONIDOS KAWAII PARA BOTONES =====
const sonidos = {
    click: null,
    success: null,
    error: null,
    pop: null
};

// Crear contexto de audio (se inicializa con la primera interacción del usuario)
let audioContext = null;

function inicializarAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Función para reproducir sonido de click suave
function sonarClick() {
    inicializarAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Nota aguda y suave
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Función para reproducir sonido de éxito (cuando guardas algo)
function sonarExito() {
    inicializarAudio();
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.frequency.value = 523.25; // Do
    oscillator2.frequency.value = 659.25; // Mi
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.3);
    oscillator2.stop(audioContext.currentTime + 0.3);
}

// Función para reproducir sonido de pop kawaii (hover en botones)
function sonarPop() {
    inicializarAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// Función para reproducir sonido de campana (al abrir modales)
function sonarCampana() {
    inicializarAudio();
    const frequencies = [1046.50, 1318.51, 1567.98]; // Do-Mi-Sol
    
    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * 0.1);
        gainNode.gain.setValueAtTime(0.08, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
    });
}

// Agregar sonidos a todos los botones
function agregarSonidosBotones() {
    // Sonido de click en todos los botones
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('btn-success')) {
                sonarExito();
            } else if (btn.classList.contains('btn-danger') || btn.classList.contains('close-modal')) {
                sonarClick();
            } else {
                sonarClick();
            }
        });
        
        // Sonido suave al pasar el mouse
        btn.addEventListener('mouseenter', () => {
            sonarPop();
        });
    });
}

// ===== CONFIGURACIÓN Y ESTADO GLOBAL =====
const state = {
    clientes: [],
    recolectores: [],
    ventasActuales: [],
    historialSemanas: [],
    semanaActual: 1,
    ventaEnEdicion: null,
    productosTemporal: [], // Array temporal para múltiples productos
    carritosLive: [], // Carritos para el live de ventas
    carritoActual: null // ID del carrito que se está editando
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Firebase primero
    if (typeof initFirebase !== 'undefined') {
        const configurado = verificarConfiguracionFirebase();
        if (configurado) {
            initFirebase();
            console.log('🔥 Firebase inicializado');
        } else {
            console.warn('⚠️ Firebase no configurado. Sistema funcionará solo localmente.');
            console.warn('📖 Para sincronizar en varios dispositivos, configura Firebase.');
        }
    }
    
    // Cargar datos
    cargarDatos();
    
    // Inicializar eventos
    inicializarEventos();
    
    // Actualizar interfaz
    actualizarDashboard();
    actualizarTablaVentas();
    actualizarListaClientes();
    actualizarListaRecolectores();
    actualizarHistorial();
    actualizarCarritosGrid();
    
    // Activar sonidos en botones después de que todo cargue
    setTimeout(() => {
        agregarSonidosBotones();
    }, 500);
});

// ===== NAVEGACIÓN ENTRE SECCIONES =====
function inicializarEventos() {
    // Navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => cambiarSeccion(btn.dataset.section));
    });

    // Botones principales
    document.getElementById('btnAgregarCliente').addEventListener('click', () => abrirModal('modalCliente'));
    document.getElementById('btnAgregarRecolector').addEventListener('click', () => abrirModal('modalRecolector'));
    document.getElementById('btnAgregarVenta').addEventListener('click', () => abrirModal('modalVenta'));
    document.getElementById('btnNuevaSemana').addEventListener('click', crearNuevaSemana);
    document.getElementById('btnGenerarHojasPagados').addEventListener('click', generarHojasEntregaPorGrupo); // ← NUEVA LÍNEA
    document.getElementById('btnAgregarProducto').addEventListener('click', agregarProductoALista);
    
    // Live de Ventas - Carritos
    document.getElementById('btnAgregarClienteRapido').addEventListener('click', agregarClienteRapidoLive);
    document.getElementById('btnAgregarAlCarrito').addEventListener('click', agregarProductoAlCarrito);
    document.getElementById('btnImprimirCarrito').addEventListener('click', imprimirTicketCarrito);
    document.getElementById('btnGenerarImagen').addEventListener('click', generarImagenCute);
    document.getElementById('btnFinalizarLive').addEventListener('click', finalizarLive);
    document.getElementById('btnLimpiarCarritos').addEventListener('click', limpiarTodosLosCarritos);
    
    // Enter en campo cliente
    document.getElementById('quickCliente').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarClienteRapidoLive();
        }
    });

    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) cerrarModal(modal.id);
        });
    });

    // Formularios
    document.getElementById('formCliente').addEventListener('submit', guardarCliente);
    document.getElementById('formRecolector').addEventListener('submit', guardarRecolector);
    document.getElementById('formVenta').addEventListener('submit', guardarVenta);

    // Cálculos automáticos en formulario de venta
    // Event listener para actualizar grupo automáticamente desde RECOLECTOR
    document.getElementById('ventaRecolector').addEventListener('change', actualizarGrupoVenta);
    
    // Event listener para actualizar grupo del cliente desde recolector
    document.getElementById('recolectorCliente').addEventListener('change', actualizarGrupoCliente);

    // Impresión de ticket
    document.getElementById('btnImprimirTicket').addEventListener('click', imprimirTicket);
    // Generar imagen desde modal de ventas
    document.getElementById('btnGenerarImagenVenta').addEventListener('click', generarImagenDesdeVenta);

    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal(modal.id);
        });
    });
}

function cambiarSeccion(seccion) {
    // Actualizar botones de navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === seccion) {
            btn.classList.add('active');
        }
    });

    // Mostrar sección correspondiente
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(seccion).classList.add('active');

    // Actualizar datos si es necesario
    if (seccion === 'dashboard') {
        actualizarDashboard();
    }
}

// ===== GESTIÓN DE MODALES =====
function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    // Prevenir scroll del body
    document.body.classList.add('modal-open');
    
    // Sonar campana kawaii al abrir modal
    sonarCampana();

    // Si es el modal de venta, actualizar los selectores
    if (modalId === 'modalVenta') {
        actualizarSelectoresVenta();
        // Si NO estamos editando, limpiar formulario
        if (!state.ventaEnEdicion) {
            limpiarFormularioVenta();
        }
    }
    
    // Si es el modal de cliente, actualizar selector de recolectores
    if (modalId === 'modalCliente') {
        actualizarSelectRecolectoresCliente();
    }
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Restaurar scroll del body
    document.body.classList.remove('modal-open');
    
    // Sonido suave al cerrar
    sonarClick();
    
    // Limpiar formularios
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // Si cerramos modal de ventas, limpiar estado de edición
    if (modalId === 'modalVenta') {
        state.ventaEnEdicion = null;
        state.productosTemporal = [];
        document.getElementById('tituloModalVenta').textContent = 'Nueva Venta 🛍️';
    }
    
    // Si cerramos modal de carrito, limpiar estado
    if (modalId === 'modalCarrito') {
        state.carritoActual = null;
    }
}

// ===== GESTIÓN DE CLIENTES =====

// Actualizar select de recolectores en modal de cliente
function actualizarSelectRecolectoresCliente() {
    const select = document.getElementById('recolectorCliente');
    select.innerHTML = '<option value="">Seleccionar recolector...</option>';
    
    state.recolectores.forEach(recolector => {
        select.innerHTML += `<option value="${recolector.id}" data-grupo="${recolector.grupo || ''}">${recolector.nombre} - ${recolector.grupo || 'Sin grupo'}</option>`;
    });
}

// Actualizar grupo del cliente cuando selecciona recolector
function actualizarGrupoCliente() {
    const select = document.getElementById('recolectorCliente');
    const inputGrupo = document.getElementById('grupoCliente');
    
    const option = select.options[select.selectedIndex];
    
    if (option && option.dataset.grupo) {
        inputGrupo.value = option.dataset.grupo;
    } else {
        inputGrupo.value = '';
    }
}

function guardarCliente(e) {
    e.preventDefault();

    const recolectorId = document.getElementById('recolectorCliente').value;
    const recolector = state.recolectores.find(r => r.id == recolectorId);

    const cliente = {
        id: Date.now(),
        nombre: document.getElementById('nombreCliente').value.trim(),
        tipo: document.getElementById('tipoCliente').value,
        recolectorId: recolectorId,
        recolector: recolector ? recolector.nombre : '',
        grupo: recolector ? recolector.grupo : ''
    };

    state.clientes.push(cliente);
    guardarDatos();
    actualizarListaClientes();
    actualizarDashboard();
    cerrarModal('modalCliente');

    // Sonido de éxito
    sonarExito();
    mostrarNotificacion('Cliente agregado exitosamente ✨', 'success');
}

function actualizarListaClientes() {
    const container = document.getElementById('listaClientes');
    
    if (state.clientes.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 3rem; margin-bottom: 10px;">👥</p>
                <p style="font-size: 1.2rem;">No hay clientes registrados</p>
                <p>¡Agrega tu primer cliente!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.clientes.map(cliente => `
        <div class="item-card">
            <h4>${cliente.nombre}</h4>
            <p><strong>Recolector:</strong> ${cliente.recolector || 'Sin asignar'}</p>
            <p><strong>Grupo:</strong> ${cliente.grupo || 'Sin grupo'}</p>
            <span class="badge ${cliente.tipo === 'Local' ? 'badge-local' : 'badge-foraneo'}">
                ${cliente.tipo}
            </span>
            <div class="item-actions">
                <button class="btn-delete" onclick="eliminarCliente(${cliente.id})">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function eliminarCliente(id) {
    if (confirm('¿Estás segura de eliminar este cliente?')) {
        state.clientes = state.clientes.filter(c => c.id !== id);
        guardarDatos();
        actualizarListaClientes();
        actualizarDashboard();
        mostrarNotificacion('Cliente eliminado', 'info');
    }
}

// ===== GESTIÓN DE RECOLECTORES =====
function guardarRecolector(e) {
    e.preventDefault();

    const recolector = {
        id: Date.now(),
        nombre: document.getElementById('nombreRecolector').value.trim(),
        grupo: document.getElementById('grupoRecolector').value.trim()
    };

    state.recolectores.push(recolector);
    guardarDatos();
    actualizarListaRecolectores();
    cerrarModal('modalRecolector');

    // Sonido de éxito
    sonarExito();
    mostrarNotificacion('Recolector agregado exitosamente ✨', 'success');
}

function actualizarListaRecolectores() {
    const container = document.getElementById('listaRecolectores');
    
    if (state.recolectores.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 3rem; margin-bottom: 10px;">🚚</p>
                <p style="font-size: 1.2rem;">No hay recolectores registrados</p>
                <p>¡Agrega tu primer recolector!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.recolectores.map(recolector => `
        <div class="item-card">
            <h4>${recolector.nombre}</h4>
            <p><strong>Grupo:</strong> ${recolector.grupo}</p>
            <div class="item-actions">
                <button class="btn-delete" onclick="eliminarRecolector(${recolector.id})">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function eliminarRecolector(id) {
    if (confirm('¿Estás segura de eliminar este recolector?')) {
        state.recolectores = state.recolectores.filter(r => r.id !== id);
        guardarDatos();
        actualizarListaRecolectores();
        mostrarNotificacion('Recolector eliminado', 'info');
    }
}

// ===== GESTIÓN DE VENTAS =====
function actualizarSelectoresVenta() {
    const selectCliente = document.getElementById('ventaCliente');
    const selectRecolector = document.getElementById('ventaRecolector');

    // Limpiar y llenar selector de clientes (SIN grupo)
    selectCliente.innerHTML = '<option value="">Seleccionar cliente...</option>';
    state.clientes.forEach(cliente => {
        selectCliente.innerHTML += `<option value="${cliente.id}">${cliente.nombre}</option>`;
    });

    // Limpiar y llenar selector de recolectores (CON grupo)
    selectRecolector.innerHTML = '<option value="">Seleccionar recolector...</option>';
    state.recolectores.forEach(recolector => {
        selectRecolector.innerHTML += `<option value="${recolector.id}" data-grupo="${recolector.grupo || ''}">${recolector.nombre}</option>`;
    });
}

// Agregar producto a la lista temporal
function agregarProductoALista() {
    const nombre = document.getElementById('nombreProducto').value.trim();
    const cantidad = parseFloat(document.getElementById('cantidadProducto').value) || 0;
    const precio = parseFloat(document.getElementById('precioProducto').value) || 0;

    if (!nombre || cantidad <= 0 || precio <= 0) {
        alert('⚠️ Por favor llena todos los campos del producto');
        return;
    }

    const producto = {
        id: Date.now(),
        nombre: nombre,
        cantidad: cantidad,
        precioUnitario: precio,
        subtotal: cantidad * precio
    };

    state.productosTemporal.push(producto);
    
    // Limpiar campos
    document.getElementById('nombreProducto').value = '';
    document.getElementById('cantidadProducto').value = '1';
    document.getElementById('precioProducto').value = '';
    
    // Sonar éxito
    sonarPop();
    
    actualizarListaProductosModal();
}

// Actualizar la lista visual de productos en el modal
function actualizarListaProductosModal() {
    const container = document.getElementById('listaProductos');
    const msgSinProductos = document.getElementById('msgSinProductos');
    
    if (state.productosTemporal.length === 0) {
        msgSinProductos.style.display = 'block';
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;" id="msgSinProductos">No hay productos agregados</p>';
    } else {
        container.innerHTML = state.productosTemporal.map(prod => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 12px; margin-bottom: 8px; border: 2px solid #FFE8F0;">
                <div style="flex: 1;">
                    <strong style="color: #E91E8C;">${prod.nombre}</strong><br>
                    <span style="font-size: 0.9rem; color: #666;">${prod.cantidad} × $${prod.precioUnitario.toFixed(2)} = $${prod.subtotal.toFixed(2)}</span>
                </div>
                <button type="button" onclick="eliminarProductoTemporal(${prod.id})" class="btn-delete" style="padding: 8px 12px;">
                    🗑️
                </button>
            </div>
        `).join('');
    }
    
    // Actualizar total
    const total = state.productosTemporal.reduce((sum, p) => sum + p.subtotal, 0);
    document.getElementById('totalVentaModal').textContent = `$${total.toFixed(2)}`;
}

// Eliminar producto de la lista temporal
function eliminarProductoTemporal(id) {
    state.productosTemporal = state.productosTemporal.filter(p => p.id !== id);
    sonarClick();
    actualizarListaProductosModal();
}

// Limpiar formulario de venta

function limpiarFormularioVenta() {
    document.getElementById('formVenta').reset();
    document.getElementById('ventaPaquetes').value = '';
    state.productosTemporal = [];
    state.ventaEnEdicion = null;
    document.getElementById('tituloModalVenta').textContent = 'Nueva Venta 🛍️';
    actualizarListaProductosModal();
}

// Editar venta existente
function editarVenta(id) {
    const venta = state.ventasActuales.find(v => v.id === id);
    if (!venta) return;
    
    state.ventaEnEdicion = id;
    
    // Abrir modal
    abrirModal('modalVenta');
    
    // Cambiar título
    document.getElementById('tituloModalVenta').textContent = 'Editar Venta ✏️';
    
    // Llenar datos
    const clienteId = state.clientes.find(c => c.nombre === venta.cliente)?.id || '';
    const recolectorId = state.recolectores.find(r => r.nombre === venta.recolector)?.id || '';
    
    document.getElementById('ventaCliente').value = clienteId;
    document.getElementById('ventaRecolector').value = recolectorId;
    document.getElementById('ventaGrupo').value = venta.grupo;
    document.getElementById('ventaPaquetes').value = venta.paquetes || 0;
    document.getElementById('ventaPago').value = venta.pago;
    
    // MANTENER productos existentes y permitir agregar más
    if (venta.productos && venta.productos.length > 0) {
        // Copiar productos existentes al array temporal
        state.productosTemporal = venta.productos.map(p => ({
            ...p,
            id: p.id || Date.now() + Math.random() // Asegurar que tenga ID
        }));
    } else {
        // Formato antiguo - convertir a nuevo formato
        state.productosTemporal = [{
            id: Date.now(),
            nombre: venta.producto || 'Producto',
            cantidad: venta.cantidad || 1,
            precioUnitario: venta.precioUnitario || 0,
            subtotal: venta.total || 0
        }];
    }
    
    actualizarListaProductosModal();
    
    // Trigger cambio de cliente/recolector para actualizar grupo
    actualizarGrupoVenta();
}

function actualizarGrupoVenta() {
    const selectRecolector = document.getElementById('ventaRecolector');
    const inputGrupo = document.getElementById('ventaGrupo');

    const recolectorOption = selectRecolector.options[selectRecolector.selectedIndex];

    // El grupo SIEMPRE viene del recolector seleccionado
    if (recolectorOption && recolectorOption.dataset.grupo) {
        inputGrupo.value = recolectorOption.dataset.grupo;
    } else {
        inputGrupo.value = '';
    }
}

function guardarVenta(e) {
    e.preventDefault();

    const clienteId = parseInt(document.getElementById('ventaCliente').value);
    const recolectorId = parseInt(document.getElementById('ventaRecolector').value);
    
    if (!clienteId || !recolectorId) {
        alert('⚠️ Selecciona un cliente y un recolector');
        return;
    }
    
    if (state.productosTemporal.length === 0) {
        alert('⚠️ Agrega al menos un producto');
        return;
    }
    
    const cliente = state.clientes.find(c => c.id === clienteId);
    const recolector = state.recolectores.find(r => r.id === recolectorId);

    const venta = {
    id: state.ventaEnEdicion || Date.now(),
    fecha: new Date().toISOString(),
    cliente: cliente ? cliente.nombre : '',
    recolector: recolector ? recolector.nombre : '',
    grupo: document.getElementById('ventaGrupo').value,
    pago: document.getElementById('ventaPago').value,
    paquetes: parseInt(document.getElementById('ventaPaquetes').value) || 0,
    productos: [...state.productosTemporal],
    total: state.productosTemporal.reduce((sum, p) => sum + p.subtotal, 0),
    cantidad: state.productosTemporal.reduce((sum, p) => sum + p.cantidad, 0)
};

    if (state.ventaEnEdicion) {
        // ACTUALIZAR venta existente (no duplicar)
        const index = state.ventasActuales.findIndex(v => v.id === state.ventaEnEdicion);
        if (index !== -1) {
            state.ventasActuales[index] = venta;
            mostrarNotificacion('Venta actualizada exitosamente ✨', 'success');
        }
    } else {
        // Agregar nueva venta
        state.ventasActuales.push(venta);
        mostrarNotificacion('Venta registrada exitosamente ✨', 'success');
    }

    guardarDatos();
    actualizarTablaVentas();
    actualizarDashboard();
    cerrarModal('modalVenta');

    // Sonido de éxito
    sonarExito();
    
    // Limpiar estado de edición
    state.ventaEnEdicion = null;
    limpiarFormularioVenta();
}

function actualizarTablaVentas() {
    const tbody = document.getElementById('ventasBody');
    
    if (state.ventasActuales.length === 0) {
        tbody.innerHTML = `
           <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    <p style="font-size: 2rem; margin-bottom: 10px;">🛍️</p>
                    <p>No hay ventas registradas en esta semana</p>
                    <p>¡Agrega tu primera venta!</p>
                </td>
            </tr>
        `;
        document.getElementById('totalVentas').textContent = '$0.00';
        return;
    }

    tbody.innerHTML = state.ventasActuales.map(venta => {
        const pagoClass = venta.pago === 'PENDIENTE' ? 'pago-pendiente' :
                         venta.pago === 'PAGADO' ? 'pago-pagado' : 'pago-no-realizo';
        
        // Si tiene múltiples productos, mostrarlos
        let productoDisplay = '';
        if (venta.productos && venta.productos.length > 0) {
            productoDisplay = venta.productos.map(p => 
                `${p.nombre} (${p.cantidad}x $${p.precioUnitario.toFixed(2)})`
            ).join('<br>');
        } else {
            // Formato antiguo (compatibilidad)
            productoDisplay = `${venta.producto || ''} (${venta.cantidad || 0}x $${(venta.precioUnitario || 0).toFixed(2)})`;
        }
        
        return `
    <tr>
        <td>${venta.cliente}</td>
        <td>${venta.recolector}</td>
        <td>${venta.grupo}</td>
        <td style="white-space: normal;">${productoDisplay}</td>
        <td class="${pagoClass}">${venta.pago}</td>
        <td>${venta.paquetes || 0}</td>
        <td style="font-weight: bold; color: #E91E8C;">$${venta.total.toFixed(2)}</td>
        <td>
            <button class="btn-edit" onclick="editarVenta(${venta.id})" title="Editar">
                ✏️
            </button>
            <button class="btn-delete" onclick="eliminarVenta(${venta.id})" title="Eliminar">
                🗑️
            </button>
        </td>
    </tr>
`;
    }).join('');

    // Calcular total
    const total = state.ventasActuales.reduce((sum, v) => sum + v.total, 0);
    document.getElementById('totalVentas').textContent = `$${total.toFixed(2)}`;
}

function eliminarVenta(id) {
    if (confirm('¿Estás segura de eliminar esta venta?')) {
        state.ventasActuales = state.ventasActuales.filter(v => v.id !== id);
        guardarDatos();
        actualizarTablaVentas();
        actualizarDashboard();
        mostrarNotificacion('Venta eliminada', 'info');
    }
}

// ===== GESTIÓN DE SEMANAS =====
function crearNuevaSemana() {
    if (state.ventasActuales.length === 0) {
        alert('No hay ventas para archivar en esta semana.');
        return;
    }

    if (!confirm('¿Crear una nueva hoja de semana? La semana actual se guardará en el historial.')) {
        return;
    }

    // Guardar semana actual en historial
    const semanaHistorial = {
        numero: state.semanaActual,
        fecha: new Date().toISOString(),
        ventas: [...state.ventasActuales],
        totalVentas: state.ventasActuales.reduce((sum, v) => sum + v.total, 0),
        totalPedidos: state.ventasActuales.length
    };

    state.historialSemanas.push(semanaHistorial);
    state.semanaActual++;
    state.ventasActuales = [];

    guardarDatos();
    actualizarTablaVentas();
    actualizarHistorial();
    actualizarDashboard();

    mostrarNotificacion(`Nueva semana creada. Ahora estás en la semana ${state.semanaActual} ✨`, 'success');
}

function actualizarHistorial() {
    const container = document.getElementById('listaHistorial');
    
    if (state.historialSemanas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 3rem; margin-bottom: 10px;">📚</p>
                <p style="font-size: 1.2rem;">No hay semanas archivadas</p>
                <p>El historial aparecerá cuando crees una nueva semana</p>
            </div>
        `;
        return;
    }

    container.innerHTML = state.historialSemanas.map(semana => {
        const fecha = new Date(semana.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="historial-card">
                <h3>Semana ${semana.numero} - ${fechaFormateada}</h3>
                <div class="historial-info">
                    <p><strong>Total de Ventas:</strong> $${semana.totalVentas.toFixed(2)}</p>
                    <p><strong>Total de Pedidos:</strong> ${semana.totalPedidos}</p>
                </div>
                <div class="historial-actions">
                    <button class="btn-kawaii btn-info" onclick="verDetallesSemana(${semana.numero})">
                        👁️ Ver Detalles
                    </button>
                    <button class="btn-kawaii btn-success" onclick="descargarCSV(${semana.numero})">
                        📥 Descargar CSV
                    </button>
                    <button class="btn-kawaii btn-danger" onclick="eliminarSemanaHistorial(${semana.numero})">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function eliminarSemanaHistorial(numeroSemana) {
    if (!confirm(`¿Estás segura de eliminar la Semana ${numeroSemana}? Esta acción no se puede deshacer.`)) {
        return;
    }
    
    state.historialSemanas = state.historialSemanas.filter(s => s.numero !== numeroSemana);
    guardarDatos();
    actualizarHistorial();
    
    sonarClick();
    mostrarNotificacion(`Semana ${numeroSemana} eliminada del historial`, 'info');
}

function verDetallesSemana(numeroSemana) {
    const semana = state.historialSemanas.find(s => s.numero === numeroSemana);
    if (!semana) return;

    const detalles = semana.ventas.map(v => 
        `${v.cliente} - ${v.producto} - ${v.cantidad} x $${v.precioUnitario} = $${v.total} (${v.pago})`
    ).join('\n');

    alert(`Detalles de Semana ${numeroSemana}\n\n${detalles}\n\nTotal: $${semana.totalVentas.toFixed(2)}`);
}

function descargarCSV(numeroSemana) {
    const semana = state.historialSemanas.find(s => s.numero === numeroSemana);
    if (!semana) return;

    let csv = 'Cliente,Recolector,Grupo,Producto,Pago,Cantidad,Precio Unitario,Total\n';
    
    semana.ventas.forEach(venta => {
        csv += `${venta.cliente},${venta.recolector},${venta.grupo},${venta.producto},${venta.pago},${venta.cantidad},${venta.precioUnitario},${venta.total}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JaLi_Bzar_Semana_${numeroSemana}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    mostrarNotificacion('CSV descargado exitosamente 📥', 'success');
}

// ===== DASHBOARD Y ESTADÍSTICAS =====
function actualizarDashboard() {
    actualizarEstadisticas();
    actualizarGraficas();
}

function actualizarEstadisticas() {
    const hoy = new Date().toDateString();
    const ventasHoy = state.ventasActuales.filter(v => 
        new Date(v.fecha).toDateString() === hoy
    );
    
    const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    const totalVentasSemana = state.ventasActuales.reduce((sum, v) => sum + v.total, 0);
    const pedidosPendientes = state.ventasActuales.filter(v => v.pago === 'PENDIENTE').length;
    const pedidosPagados = state.ventasActuales.filter(v => v.pago === 'PAGADO').length;

    document.getElementById('ventasHoy').textContent = `$${totalVentasHoy.toFixed(2)}`;
    document.getElementById('ventasSemana').textContent = `$${totalVentasSemana.toFixed(2)}`;
    document.getElementById('totalClientes').textContent = state.clientes.length;
    document.getElementById('pedidosPendientes').textContent = pedidosPendientes;
    document.getElementById('pedidosPagados').textContent = pedidosPagados;
}

function actualizarGraficas() {
    crearGraficaVentasDia();
    crearGraficaTopClientes();
    crearGraficaRecolectores();
    crearGraficaProductos();
}

function crearGraficaVentasDia() {
    const ctx = document.getElementById('chartVentasDia');
    if (!ctx) return;

    // Destruir gráfica anterior si existe
    if (window.chartVentasDia instanceof Chart) {
        window.chartVentasDia.destroy();
    }

    // Agrupar ventas por día
    const ventasPorDia = {};
    state.ventasActuales.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleDateString('es-MX', { 
            month: 'short', 
            day: 'numeric' 
        });
        ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + venta.total;
    });

    // Si no hay ventas, mostrar datos de ejemplo
    const labels = Object.keys(ventasPorDia).length > 0 
        ? Object.keys(ventasPorDia) 
        : ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    const data = Object.values(ventasPorDia).length > 0 
        ? Object.values(ventasPorDia) 
        : [0, 0, 0, 0, 0];

    window.chartVentasDia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: data,
                borderColor: '#FF8AB8',
                backgroundColor: 'rgba(255, 138, 184, 0.2)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#FF69B4',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    display: true,
                    labels: {
                        color: '#E91E8C',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 182, 217, 0.2)'
                    },
                    ticks: {
                        color: '#E91E8C'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 182, 217, 0.2)'
                    },
                    ticks: {
                        color: '#E91E8C'
                    }
                }
            }
        }
    });
}

function crearGraficaTopClientes() {
    const ctx = document.getElementById('chartTopClientes');
    if (!ctx) return;

    // Destruir gráfica anterior si existe
    if (window.chartTopClientes instanceof Chart) {
        window.chartTopClientes.destroy();
    }

    // Agrupar ventas por cliente
    const ventasPorCliente = {};
    state.ventasActuales.forEach(venta => {
        ventasPorCliente[venta.cliente] = (ventasPorCliente[venta.cliente] || 0) + venta.total;
    });

    const top5 = Object.entries(ventasPorCliente)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Si no hay datos, mostrar ejemplo
    const labels = top5.length > 0 ? top5.map(c => c[0]) : ['Cliente 1', 'Cliente 2', 'Cliente 3'];
    const data = top5.length > 0 ? top5.map(c => c[1]) : [0, 0, 0];

    window.chartTopClientes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: data,
                backgroundColor: [
                    'rgba(255, 182, 217, 0.8)',
                    'rgba(230, 201, 255, 0.8)',
                    'rgba(184, 230, 255, 0.8)',
                    'rgba(255, 249, 196, 0.8)',
                    'rgba(200, 230, 201, 0.8)'
                ],
                borderColor: [
                    '#FF8AB8',
                    '#D1A3FF',
                    '#64B5F6',
                    '#FFD54F',
                    '#81C784'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 182, 217, 0.2)'
                    },
                    ticks: {
                        color: '#E91E8C'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#E91E8C'
                    }
                }
            }
        }
    });
}

function crearGraficaRecolectores() {
    const ctx = document.getElementById('chartRecolectores');
    if (!ctx) return;

    // Destruir gráfica anterior si existe
    if (window.chartRecolectores instanceof Chart) {
        window.chartRecolectores.destroy();
    }

    const ventasPorRecolector = {};
    state.ventasActuales.forEach(venta => {
        ventasPorRecolector[venta.recolector] = (ventasPorRecolector[venta.recolector] || 0) + venta.total;
    });

    // Si no hay datos, mostrar ejemplo
    const labels = Object.keys(ventasPorRecolector).length > 0 
        ? Object.keys(ventasPorRecolector) 
        : ['Recolector 1', 'Recolector 2'];
    const data = Object.values(ventasPorRecolector).length > 0 
        ? Object.values(ventasPorRecolector) 
        : [0, 0];

    window.chartRecolectores = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 182, 217, 0.9)',
                    'rgba(230, 201, 255, 0.9)',
                    'rgba(184, 230, 255, 0.9)',
                    'rgba(200, 230, 201, 0.9)',
                    'rgba(255, 249, 196, 0.9)'
                ],
                borderColor: [
                    '#FF8AB8',
                    '#D1A3FF',
                    '#64B5F6',
                    '#81C784',
                    '#FFD54F'
                ],
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#E91E8C',
                        font: { size: 11, weight: 'bold' },
                        padding: 15
                    }
                }
            }
        }
    });
}

function crearGraficaProductos() {
    const ctx = document.getElementById('chartProductos');
    if (!ctx) return;

    // Destruir gráfica anterior si existe
    if (window.chartProductos instanceof Chart) {
        window.chartProductos.destroy();
    }

    const productosCantidad = {};
    state.ventasActuales.forEach(venta => {
        productosCantidad[venta.producto] = (productosCantidad[venta.producto] || 0) + venta.cantidad;
    });

    const top5 = Object.entries(productosCantidad)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Si no hay datos, mostrar ejemplo
    const labels = top5.length > 0 ? top5.map(p => p[0]) : ['Producto 1', 'Producto 2', 'Producto 3'];
    const data = top5.length > 0 ? top5.map(p => p[1]) : [0, 0, 0];

    window.chartProductos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad Vendida',
                data: data,
                backgroundColor: 'rgba(184, 230, 255, 0.8)',
                borderColor: '#64B5F6',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 182, 217, 0.2)'
                    },
                    ticks: {
                        color: '#E91E8C'
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#E91E8C'
                    }
                }
            }
        }
    });
}

// ===== IMPRESIÓN DE TICKET =====
function imprimirTicket() {
    // Si estamos editando una venta, usar sus datos
    if (state.ventaEnEdicion) {
        const ventaExistente = state.ventasActuales.find(v => v.id === state.ventaEnEdicion);
        if (ventaExistente) {
            imprimirTicketVenta(ventaExistente);
            return;
        }
    }
    
    // Si es una venta nueva, verificar que haya productos en el temporal
    if (state.productosTemporal.length === 0) {
        alert('⚠️ Agrega al menos un producto antes de imprimir');
        return;
    }
    
    // Obtener datos del formulario para venta nueva
    const clienteId = parseInt(document.getElementById('ventaCliente').value);
    const recolectorId = parseInt(document.getElementById('ventaRecolector').value);
    
    if (!clienteId || !recolectorId) {
        alert('⚠️ Por favor selecciona un cliente y un recolector antes de imprimir');
        return;
    }

    const cliente = state.clientes.find(c => c.id === clienteId);
    const recolector = state.recolectores.find(r => r.id === recolectorId);
    const pago = document.getElementById('ventaPago').value || 'PENDIENTE';
    const grupo = document.getElementById('ventaGrupo').value || '';

    const ventaTemporal = {
        cliente: cliente ? cliente.nombre : '',
        recolector: recolector ? recolector.nombre : '',
        grupo: grupo,
        pago: pago,
        productos: state.productosTemporal,
        total: state.productosTemporal.reduce((sum, p) => sum + p.subtotal, 0)
    };

    imprimirTicketVenta(ventaTemporal);
}

function imprimirTicketVenta(venta) {
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '', 'width=800,height=600');
    
    // Generar filas de productos
    const productos = venta.productos || [{
        nombre: venta.producto || 'Producto',
        cantidad: venta.cantidad || 1,
        precioUnitario: venta.precioUnitario || 0,
        subtotal: venta.total || 0
    }];
    
    const filasProductos = productos.map(prod => `
        <div class="fila">
            <span>${prod.nombre}</span>
            <span>${prod.cantidad} × $${prod.precioUnitario.toFixed(2)}</span>
        </div>
        <div class="fila" style="padding-left: 20px; font-size: 11px; color: #666;">
            <span>Subtotal:</span>
            <span>$${prod.subtotal.toFixed(2)}</span>
        </div>
    `).join('');
    
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ticket - JaLi Bzar</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Courier New', monospace;
                    padding: 20px;
                    background: white;
                }
                
                .ticket {
                    width: 80mm;
                    margin: 0 auto;
                    padding: 10mm;
                    background: white;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 10px;
                }
                
                .logo-img {
                    max-width: 100px;
                    max-height: 80px;
                    margin: 0 auto 10px;
                    display: block;
                }
                
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #E91E8C;
                    margin-bottom: 8px;
                }
                
                .fecha {
                    font-size: 11px;
                    color: #666;
                }
                
                .emoji {
                    font-size: 24px;
                    margin: 8px 0;
                }
                
                .seccion {
                    margin: 15px 0;
                    font-size: 12px;
                }
                
                .fila {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                }
                
                .label {
                    font-weight: bold;
                }
                
                .separador {
                    border-top: 1px dashed #000;
                    margin: 10px 0;
                }
                
                .total {
                    border-top: 2px solid #000;
                    margin-top: 15px;
                    padding-top: 10px;
                    text-align: right;
                    font-size: 16px;
                    font-weight: bold;
                }
                
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 2px dashed #000;
                    font-size: 11px;
                }
                
                .gracias {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                @media print {
                    body {
                        padding: 0;
                    }
                    
                    .ticket {
                        width: 80mm;
                        padding: 5mm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <img src="./logo.png" alt="JaLi Bzar" class="logo-img" onerror="this.style.display='none'">
                    <div class="emoji">🛍️💗🌸</div>
                    <div class="fecha">${new Date().toLocaleString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
                
                <div class="seccion">
                    <div class="fila">
                        <span class="label">Cliente:</span>
                        <span>${venta.cliente}</span>
                    </div>
                    <div class="fila">
                        <span class="label">Recolector:</span>
                        <span>${venta.recolector}</span>
                    </div>
                    <div class="fila">
                        <span class="label">Grupo:</span>
                        <span>${venta.grupo}</span>
                    </div>
                    <div class="fila">
                        <span class="label">Estado:</span>
                        <span>${venta.pago}</span>
                    </div>
                </div>
                
                <div class="separador"></div>
                
                <div class="seccion">
                    <div style="font-weight: bold; margin-bottom: 10px; text-align: center;">PRODUCTOS</div>
                    ${filasProductos}
                </div>
                
                <div class="total">
                    TOTAL: $${venta.total.toFixed(2)}
                </div>
                
                <div class="footer">
                    <div class="gracias">¡GRACIAS POR TU COMPRA!</div>
                    <div class="emoji">✨💗🌸</div>
                    <div style="color: #E91E8C; font-weight: bold; margin-top: 5px;">JaLi Bzar</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    ventanaImpresion.document.close();
    
    // Esperar a que cargue y luego imprimir
    setTimeout(() => {
        ventanaImpresion.focus();
        ventanaImpresion.print();
        ventanaImpresion.close();
    }, 250);
}

function generarTicketHTML(venta) {
    // Esta función ya no es necesaria pero la dejamos por compatibilidad
    return;
}

// ===== GENERAR IMAGEN CUTE DESDE MODAL DE VENTAS =====

// ===== GENERAR IMAGEN CUTE DESDE MODAL DE VENTAS =====
function generarImagenDesdeVenta() {
    // Si estamos editando una venta, usar sus datos
    if (state.ventaEnEdicion) {
        const ventaExistente = state.ventasActuales.find(v => v.id === state.ventaEnEdicion);
        if (ventaExistente) {
            generarImagenCuteDesdeVenta(ventaExistente);
            return;
        }
    }
    
    // Si es una venta nueva, verificar que haya productos
    if (state.productosTemporal.length === 0) {
        alert('⚠️ Agrega al menos un producto antes de generar la imagen');
        return;
    }
    
    // Obtener datos del formulario
    const clienteId = parseInt(document.getElementById('ventaCliente').value);
    const recolectorId = parseInt(document.getElementById('ventaRecolector').value);
    
    if (!clienteId || !recolectorId) {
        alert('⚠️ Por favor selecciona un cliente y un recolector');
        return;
    }

    const cliente = state.clientes.find(c => c.id === clienteId);
    const recolector = state.recolectores.find(r => r.id === recolectorId);
    const grupo = document.getElementById('ventaGrupo').value || '';

    const ventaTemporal = {
        cliente: cliente ? cliente.nombre : '',
        recolector: recolector ? recolector.nombre : '',
        grupo: grupo,
        productos: state.productosTemporal,
        total: state.productosTemporal.reduce((sum, p) => sum + p.subtotal, 0)
    };

    generarImagenCuteDesdeVenta(ventaTemporal);
}
function generarImagenCuteDesdeVenta(venta) {
    const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Crear tabla de productos (máximo 5 filas visibles)
    const filasProductos = venta.productos.slice(0, 5).map(prod => `
        <tr>
            <td style="padding: 12px 8px; border: 1px solid #FFD1E8;">${prod.nombre}</td>
            <td style="padding: 12px 8px; border: 1px solid #FFD1E8; text-align: center;">${prod.cantidad}</td>
            <td style="padding: 12px 8px; border: 1px solid #FFD1E8; text-align: center;">$${prod.precioUnitario.toFixed(2)}</td>
            <td style="padding: 12px 8px; border: 1px solid #FFD1E8; text-align: center; font-weight: 600;">$${prod.subtotal.toFixed(2)}</td>
        </tr>
    `).join('');
    
    // Abrir ventana con la vista previa
    const ventana = window.open('', '', 'width=900,height=1200');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Nota de Venta - ${venta.cliente}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
                    background: linear-gradient(135deg, #FFB6D9 0%, #FF8AB8 100%);
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .nota {
                    width: 800px;
                    background: white;
                    border-radius: 30px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    position: relative;
                }
                .decoracion-izq {
                    position: absolute;
                    left: 0;
                    top: 0;
                    font-size: 60px;
                }
                .decoracion-der {
                    position: absolute;
                    right: 0;
                    top: 0;
                    font-size: 60px;
                }
                .logo-img {
                    max-width: 300px;
                    margin: 0 auto 15px;
                    display: block;
                }
                .titulo {
                    font-size: 48px;
                    color: #9B59B6;
                    font-weight: bold;
                    margin-bottom: 5px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                }
                .subtitulo {
                    font-size: 20px;
                    color: #FF69B4;
                    font-style: italic;
                }
                .subtitulo-esp {
                    font-size: 18px;
                    color: #E8A547;
                    font-family: 'Brush Script MT', cursive;
                }
                .info-box {
                    background: linear-gradient(135deg, #FFF5F9, #FFE8F0);
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 30px;
                    border: 3px solid #FFB6D9;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }
                .info-label {
                    color: #FF69B4;
                    font-weight: bold;
                    font-size: 18px;
                }
                .info-value {
                    color: #333;
                    font-size: 18px;
                }
                .productos-box {
                    background: linear-gradient(135deg, #FFF5F9, #FFE8F0);
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 25px;
                    border: 3px solid #FFB6D9;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th {
                    background: linear-gradient(135deg, #FFB6D9, #FF8AB8);
                    color: white;
                    padding: 15px 8px;
                    font-size: 18px;
                    border: 1px solid #FF8AB8;
                }
                td {
                    font-size: 16px;
                }
                .metodo-pago {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .metodo-label {
                    color: #FF69B4;
                    font-weight: bold;
                    font-size: 18px;
                }
                .metodo-opcion {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                }
                .circulo {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #FFB6D9;
                    border-radius: 50%;
                    display: inline-block;
                }
                .circulo-azul { border-color: #64B5F6; background: #64B5F6; }
                .circulo-amarillo { border-color: #FFD54F; background: #FFD54F; }
                .circulo-rosa { border-color: #FFB6D9; }
                .total-box {
                    background: linear-gradient(135deg, #FFF5F9, #FFE8F0);
                    border: 3px solid #FFB6D9;
                    border-radius: 15px;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .total-label {
                    font-size: 28px;
                    color: #FF69B4;
                    font-weight: bold;
                }
                .total-monto {
                    font-size: 36px;
                    color: #9B59B6;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    padding: 15px;
                    border-top: 2px dashed #FFB6D9;
                    margin-top: 20px;
                }
                .footer-icono {
                    font-size: 40px;
                    margin-bottom: 10px;
                }
                .footer-text {
                    color: #FF69B4;
                    font-size: 24px;
                    font-weight: bold;
                }
                .botonera {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 10000;
                }
                .btn-accion {
                    background: linear-gradient(135deg, #FF8AB8, #FFB6D9);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 50px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(255, 138, 184, 0.4);
                    font-family: 'Comic Sans MS', sans-serif;
                }
                .btn-cerrar {
                    background: linear-gradient(135deg, #E0E0E0, #BDBDBD);
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div id="notaCaptura">
                <div class="nota">
                    <div class="header">
                        <div class="decoracion-izq">🌸🩷</div>
                        <div class="decoracion-der">🌸🩷</div>
                        <img src="./logo.png" alt="JaLi Bzar" class="logo-img">
                        <div class="subtitulo">✨💜✨</div>
                        <div class="subtitulo-esp">Gracias por su compra</div>
                    </div>
                    
                    <div class="info-box">
                        <div class="info-row">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${fecha}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Nombre:</span>
                            <span class="info-value">${venta.cliente}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Recolector:</span>
                            <span class="info-value">${venta.recolector}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Grupo:</span>
                            <span class="info-value">${venta.grupo}</span>
                        </div>
                    </div>
                    
                    <div class="productos-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filasProductos}
                                ${venta.productos.length > 5 ? `
                                    <tr>
                                        <td colspan="4" style="text-align: center; padding: 10px; color: #999; font-style: italic;">
                                            + ${venta.productos.length - 5} productos más...
                                        </td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="info-box">
                        <div class="metodo-pago">
                            <span class="metodo-label">Método de pago</span>
                            <div class="metodo-opcion">
                                <span class="circulo"></span>
                                <span>Efectivo</span>
                            </div>
                            <div class="metodo-opcion">
                                <span class="circulo circulo-azul"></span>
                                <span>Transferencia</span>
                            </div>
                            <div class="metodo-opcion">
                                <span class="circulo circulo-rosa"></span>
                                <span>Pagado</span>
                            </div>
                            <div class="metodo-opcion">
                                <span class="circulo circulo-amarillo"></span>
                                <span>Pendiente a pagar</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="total-box">
                        <span class="total-label">Total</span>
                        <span class="total-monto">$${venta.total.toFixed(2)}</span>
                    </div>
                    
                    <div class="footer">
                        <div class="footer-icono">🌷</div>
                        <div class="footer-text">JaLi Bzar</div>
                    </div>
                </div>
            </div>
            
            <div class="botonera">
                <button class="btn-accion" onclick="descargarImagen()">📥 Descargar PNG</button>
                <button class="btn-accion btn-cerrar" onclick="window.close()">❌ Cerrar</button>
            </div>
            
            <script>
                function descargarImagen() {
                    const elemento = document.getElementById('notaCaptura');
                    html2canvas(elemento, {
                        scale: 2,
                        backgroundColor: null,
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    }).then(canvas => {
                        canvas.toBlob(blob => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'JaLi_Bzar_${venta.cliente}_' + new Date().getTime() + '.png';
                            a.click();
                            URL.revokeObjectURL(url);
                            alert('✅ Imagen descargada exitosamente!');
                        }, 'image/png');
                    }).catch(error => {
                        console.error('Error:', error);
                        alert('⚠️ Error al generar la imagen. Intenta de nuevo.');
                    });
                }
            </script>
        </body>
        </html>
    `);
    
    ventana.document.close();
    sonarExito();
    mostrarNotificacion('📸 Vista previa lista! Descarga cuando quieras', 'success');
}
// ===== LIVE DE VENTAS - SISTEMA DE CARRITOS =====

// Agregar cliente rápido (solo nombre, sin productos)
function agregarClienteRapidoLive() {
    const nombreCliente = document.getElementById('quickCliente').value.trim();
    
    if (!nombreCliente) {
        alert('⚠️ Escribe el nombre del cliente');
        document.getElementById('quickCliente').focus();
        return;
    }
    
    // Buscar si el cliente ya existe
    const existe = state.carritosLive.find(c => 
        c.nombre.toLowerCase() === nombreCliente.toLowerCase()
    );
    
    if (existe) {
        alert('⚠️ Este cliente ya existe');
        document.getElementById('quickCliente').value = '';
        document.getElementById('quickCliente').focus();
        return;
    }
    
    // Crear carrito nuevo vacío
    const carrito = {
        id: Date.now(),
        nombre: nombreCliente,
        productos: [],
        total: 0
    };
    
    state.carritosLive.unshift(carrito); // unshift para agregar al inicio
    
    // Limpiar campo
    document.getElementById('quickCliente').value = '';
    document.getElementById('quickCliente').focus();
    
    guardarDatos();
    actualizarCarritosGrid();
    sonarExito();
    mostrarNotificacion(`✅ Cliente ${nombreCliente} agregado`, 'success');
}

// Actualizar grid de carritos (VISTA DUAL: Lista en móvil, Cuadros en PC)
function actualizarCarritosGrid() {
    const container = document.getElementById('carritosContainer');
    if (!container) {
        console.warn('Container de carritos no encontrado');
        return;
    }
    
    // Asegurar que carritosLive existe
    if (!state.carritosLive) {
        state.carritosLive = [];
    }
    
    // Limpiar container
    container.innerHTML = '';
    
    if (state.carritosLive.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 2rem; margin-bottom: 10px;">📹</p>
                <p style="font-size: 1.1rem;">No hay clientes en el live</p>
                <p>Presiona el botón ➕ para agregar</p>
            </div>
        `;
        return;
    }
    
    // Crear elementos para cada carrito (se agregan al FINAL pero por CSS se ven al inicio)
    state.carritosLive.forEach(carrito => {
        const cantidadProductos = carrito.productos ? carrito.productos.length : 0;
        const total = carrito.total || 0;
        
        // VISTA LISTA (Móvil)
        const itemLista = document.createElement('div');
        itemLista.className = 'carrito-item-lista';
        itemLista.onclick = () => abrirCarrito(carrito.id);
        itemLista.innerHTML = `
            <div class="carrito-item-lista-content">
                <span class="carrito-item-nombre">👤 ${carrito.nombre}</span>
                <span class="carrito-item-badge">${cantidadProductos}</span>
            </div>
            <span class="carrito-item-total">$${total.toFixed(2)}</span>
            <button class="carrito-item-eliminar" onclick="event.stopPropagation(); eliminarCarrito(${carrito.id})">
                🗑️
            </button>
        `;
        
        // VISTA CUADROS (PC)
        const itemCard = document.createElement('div');
        itemCard.className = 'carrito-card';
        itemCard.onclick = () => abrirCarrito(carrito.id);
        itemCard.innerHTML = `
            <div class="carrito-header">
                <div class="carrito-nombre">
                    👤 ${carrito.nombre}
                </div>
                <button class="carrito-eliminar" onclick="event.stopPropagation(); eliminarCarrito(${carrito.id})" title="Eliminar">
                    🗑️
                </button>
            </div>
            <div class="carrito-productos">
                <div class="carrito-badge">
                    📦 ${cantidadProductos} ${cantidadProductos === 1 ? 'producto' : 'productos'}
                </div>
                ${carrito.productos && carrito.productos.length > 0 ? `
                    <div style="margin-top: 10px; max-height: 60px; overflow-y: auto;">
                        ${carrito.productos.slice(0, 3).map(p => `
                            <div class="carrito-producto-item">
                                <span>${p.nombre}</span>
                                <span style="color: #E91E8C; font-weight: 600;">$${p.subtotal.toFixed(2)}</span>
                            </div>
                        `).join('')}
                        ${carrito.productos.length > 3 ? '<p style="color: #999; font-size: 0.8rem; text-align: center; margin-top: 5px;">+ más productos...</p>' : ''}
                    </div>
                ` : '<p style="color: #999; font-size: 0.85rem; margin-top: 10px;">Sin productos aún</p>'}
            </div>
            <div class="carrito-total">
                <div class="carrito-total-label">Total</div>
                <div class="carrito-total-monto">$${total.toFixed(2)}</div>
            </div>
        `;
        
        container.appendChild(itemLista);
        container.appendChild(itemCard);
    });
    
    console.log(`✅ Grid actualizado con ${state.carritosLive.length} carritos`);
}

// Abrir carrito para ver/editar productos
function abrirCarrito(carritoId) {
    const carrito = state.carritosLive.find(c => c.id === carritoId);
    if (!carrito) return;
    
    state.carritoActual = carritoId;
    
    // Actualizar título
    document.getElementById('nombreClienteCarrito').textContent = carrito.nombre;
    
    // Mostrar productos
    actualizarListaProductosCarrito();
    
    // Abrir modal
    abrirModal('modalCarrito');
}

// Agregar producto al carrito actual (desde el modal)
function agregarProductoAlCarrito() {
    if (!state.carritoActual) return;
    
    const nombre = document.getElementById('carritoProducto').value.trim();
    const cantidad = parseFloat(document.getElementById('carritoCantidad').value) || 0;
    const precio = parseFloat(document.getElementById('carritoPrecio').value) || 0;
    
    if (!nombre || cantidad <= 0 || precio <= 0) {
        alert('⚠️ Por favor llena todos los campos del producto');
        return;
    }
    
    const carrito = state.carritosLive.find(c => c.id === state.carritoActual);
    if (!carrito) return;
    
    const producto = {
        id: Date.now() + Math.random(),
        nombre: nombre,
        cantidad: cantidad,
        precioUnitario: precio,
        subtotal: cantidad * precio
    };
    
    carrito.productos.push(producto);
    carrito.total = carrito.productos.reduce((sum, p) => sum + p.subtotal, 0);
    
    // Limpiar campos (cantidad también)
    document.getElementById('carritoProducto').value = '';
    document.getElementById('carritoCantidad').value = '';
    document.getElementById('carritoPrecio').value = '';
    
    // Enfocar en producto
    document.getElementById('carritoProducto').focus();
    
    guardarDatos();
    actualizarListaProductosCarrito();
    actualizarCarritosGrid();
    sonarPop();
}

// Actualizar lista de productos en el modal del carrito
function actualizarListaProductosCarrito() {
    const carrito = state.carritosLive.find(c => c.id === state.carritoActual);
    if (!carrito) return;
    
    const container = document.getElementById('listaProductosCarrito');
    
    if (!carrito.productos || carrito.productos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 10px; font-size: 0.85rem;">Sin productos</p>';
    } else {
        container.innerHTML = carrito.productos.map(prod => `
            <div class="producto-mini-item">
                <div class="producto-mini-info">
                    <span class="producto-mini-nombre">${prod.nombre}</span>
                    <span class="producto-mini-detalle">${prod.cantidad} × $${prod.precioUnitario.toFixed(2)} = $${prod.subtotal.toFixed(2)}</span>
                </div>
                <button type="button" onclick="eliminarProductoCarrito(${prod.id})" style="background: var(--rojo-pastel); color: #C62828; border: none; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                    🗑️
                </button>
            </div>
        `).join('');
    }
    
    document.getElementById('totalCarrito').textContent = `$${(carrito.total || 0).toFixed(2)}`;
}

// Eliminar producto del carrito
function eliminarProductoCarrito(productoId) {
    const carrito = state.carritosLive.find(c => c.id === state.carritoActual);
    if (!carrito) return;
    
    carrito.productos = carrito.productos.filter(p => p.id !== productoId);
    carrito.total = carrito.productos.reduce((sum, p) => sum + p.subtotal, 0);
    
    guardarDatos();
    actualizarListaProductosCarrito();
    actualizarCarritosGrid();
    sonarClick();
}

// Eliminar carrito completo
function eliminarCarrito(carritoId) {
    const carrito = state.carritosLive.find(c => c.id === carritoId);
    if (!carrito) return;
    
    if (!confirm(`¿Eliminar el carrito de ${carrito.nombre}?`)) return;
    
    state.carritosLive = state.carritosLive.filter(c => c.id !== carritoId);
    guardarDatos();
    actualizarCarritosGrid();
    sonarClick();
    mostrarNotificacion(`Carrito de ${carrito.nombre} eliminado`, 'info');
}

// Imprimir ticket del carrito
function imprimirTicketCarrito() {
    const carrito = state.carritosLive.find(c => c.id === state.carritoActual);
    if (!carrito) return;
    
    if (!carrito.productos || carrito.productos.length === 0) {
        alert('⚠️ No hay productos en el carrito para imprimir');
        return;
    }
    
    const ventanaImpresion = window.open('', '', 'width=800,height=600');
    
    const filasProductos = carrito.productos.map(prod => `
        <div class="fila">
            <span>${prod.nombre}</span>
            <span>${prod.cantidad} × $${prod.precioUnitario.toFixed(2)}</span>
        </div>
        <div class="fila" style="padding-left: 20px; font-size: 11px; color: #666;">
            <span>Subtotal:</span>
            <span>$${prod.subtotal.toFixed(2)}</span>
        </div>
    `).join('');
    
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ticket - ${carrito.nombre}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Courier New', monospace; padding: 20px; background: white; }
                .ticket { width: 80mm; margin: 0 auto; padding: 10mm; background: white; }
                .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                .logo-img { max-width: 100px; max-height: 80px; margin: 0 auto 10px; display: block; }
                .logo { font-size: 28px; font-weight: bold; color: #E91E8C; margin-bottom: 8px; }
                .fecha { font-size: 11px; color: #666; }
                .emoji { font-size: 24px; margin: 8px 0; }
                .seccion { margin: 15px 0; font-size: 12px; }
                .fila { display: flex; justify-content: space-between; padding: 4px 0; }
                .label { font-weight: bold; }
                .separador { border-top: 1px dashed #000; margin: 10px 0; }
                .total { border-top: 2px solid #000; margin-top: 15px; padding-top: 10px; text-align: right; font-size: 16px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; font-size: 11px; }
                .gracias { font-weight: bold; margin-bottom: 5px; }
                @media print {
                    body { padding: 0; }
                    .ticket { width: 80mm; padding: 5mm; }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <img src="logo.png" alt="JaLi Bzar" class="logo-img" onerror="this.style.display='none'">
                    <div class="logo">JALI BZAR</div>
                    <div class="emoji">🛍️💗🌸</div>
                    <div class="fecha">${new Date().toLocaleString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
                
                <div class="seccion">
                    <div class="fila">
                        <span class="label">Cliente:</span>
                        <span>${carrito.nombre}</span>
                    </div>
                    <div class="fila">
                        <span class="label">Tipo:</span>
                        <span>LIVE FACEBOOK 📹</span>
                    </div>
                </div>
                
                <div class="separador"></div>
                
                <div class="seccion">
                    <div style="font-weight: bold; margin-bottom: 10px; text-align: center;">PRODUCTOS</div>
                    ${filasProductos}
                </div>
                
                <div class="total">
                    TOTAL: $${(carrito.total || 0).toFixed(2)}
                </div>
                
                <div class="footer">
                    <div class="gracias">¡GRACIAS POR TU COMPRA!</div>
                    <div class="emoji">✨💗🌸</div>
                    <div style="color: #E91E8C; font-weight: bold; margin-top: 5px;">JaLi Bzar</div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    ventanaImpresion.document.close();
    
    setTimeout(() => {
        ventanaImpresion.focus();
        ventanaImpresion.print();
        ventanaImpresion.close();
    }, 250);
}

// Generar imagen cute para foráneos (estilo nota rosa)
function generarImagenCute() {
    const carrito = state.carritosLive.find(c => c.id === state.carritoActual);
    if (!carrito) return;
    
    if (!carrito.productos || carrito.productos.length === 0) {
        alert('⚠️ No hay productos en el carrito para generar imagen');
        return;
    }
    
    const cliente = state.clientes.find(c => c.nombre.toLowerCase() === carrito.nombre.toLowerCase());
    const recolector = cliente && cliente.recolector ? cliente.recolector : 'Facebook Live';
    const grupo = cliente && cliente.grupo ? cliente.grupo : 'LIVE';
    
    const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const filasProductos = carrito.productos.slice(0, 5).map(prod => `
        <tr>
            <td style="padding: 12px 8px; border: 1px solid #FFD1E8;">${prod.nombre}</td>
            <td style="padding: 12px 8px; border: 1px solid #FFD1E8; text-align: center;">${prod.cantidad}</td>
            <td style="padding: 12px 8px; border: 1px solid #FFD1E8; text-align: center;">$${prod.precioUnitario.toFixed(2)}</td>
            <td style="padding: 12px 8px; border: 1px solid #FFD1E8; text-align: center; font-weight: 600;">$${prod.subtotal.toFixed(2)}</td>
        </tr>
    `).join('');
    
    const ventana = window.open('', '', 'width=900,height=1200');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Nota de Venta - ${carrito.nombre}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
                    background: linear-gradient(135deg, #FFB6D9 0%, #FF8AB8 100%);
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .nota {
                    width: 800px;
                    background: white;
                    border-radius: 30px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    position: relative;
                }
                .decoracion-izq {
                    position: absolute;
                    left: 0;
                    top: 0;
                    font-size: 60px;
                }
                .decoracion-der {
                    position: absolute;
                    right: 0;
                    top: 0;
                    font-size: 60px;
                }
                .logo-img {
                    max-width: 300px;
                    margin: 0 auto 15px;
                    display: block;
                }
                .titulo {
                    font-size: 48px;
                    color: #9B59B6;
                    font-weight: bold;
                    margin-bottom: 5px;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                }
                .subtitulo {
                    font-size: 20px;
                    color: #FF69B4;
                    font-style: italic;
                }
                .subtitulo-esp {
                    font-size: 18px;
                    color: #E8A547;
                    font-family: 'Brush Script MT', cursive;
                }
                .info-box {
                    background: linear-gradient(135deg, #FFF5F9, #FFE8F0);
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 30px;
                    border: 3px solid #FFB6D9;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }
                .info-label {
                    color: #FF69B4;
                    font-weight: bold;
                    font-size: 18px;
                }
                .info-value {
                    color: #333;
                    font-size: 18px;
                }
                .productos-box {
                    background: linear-gradient(135deg, #FFF5F9, #FFE8F0);
                    border-radius: 20px;
                    padding: 25px;
                    margin-bottom: 25px;
                    border: 3px solid #FFB6D9;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th {
                    background: linear-gradient(135deg, #FFB6D9, #FF8AB8);
                    color: white;
                    padding: 15px 8px;
                    font-size: 18px;
                    border: 1px solid #FF8AB8;
                }
                td {
                    font-size: 16px;
                }
                .metodo-pago {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .metodo-label {
                    color: #FF69B4;
                    font-weight: bold;
                    font-size: 18px;
                }
                .metodo-opcion {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 16px;
                }
                .circulo {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #FFB6D9;
                    border-radius: 50%;
                    display: inline-block;
                }
                .circulo-azul { border-color: #64B5F6; background: #64B5F6; }
                .circulo-amarillo { border-color: #FFD54F; background: #FFD54F; }
                .circulo-rosa { border-color: #FFB6D9; }
                .total-box {
                    background: linear-gradient(135deg, #FFF5F9, #FFE8F0);
                    border: 3px solid #FFB6D9;
                    border-radius: 15px;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .total-label {
                    font-size: 28px;
                    color: #FF69B4;
                    font-weight: bold;
                }
                .total-monto {
                    font-size: 36px;
                    color: #9B59B6;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    padding: 15px;
                    border-top: 2px dashed #FFB6D9;
                    margin-top: 20px;
                }
                .footer-icono {
                    font-size: 40px;
                    margin-bottom: 10px;
                }
                .footer-text {
                    color: #FF69B4;
                    font-size: 24px;
                    font-weight: bold;
                }
                .botonera {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 10000;
                }
                .btn-accion {
                    background: linear-gradient(135deg, #FF8AB8, #FFB6D9);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 50px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(255, 138, 184, 0.4);
                    font-family: 'Comic Sans MS', sans-serif;
                }
                .btn-cerrar {
                    background: linear-gradient(135deg, #E0E0E0, #BDBDBD);
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div id="notaCaptura">
                <div class="nota">
                    <div class="header">
                        <div class="decoracion-izq">🛍️💗</div>
                        <div class="decoracion-der">📦🎀</div>
                        <img src="./logo.png" alt="JaLi Bzar" class="logo-img">
                        <div class="titulo">JaLi Bzar</div>
                        <div class="subtitulo">💗</div>
                        <div class="subtitulo-esp">Gracias por su compra</div>
                    </div>
                    
                    <div class="info-box">
                        <div class="info-row">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${fecha}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Nombre:</span>
                            <span class="info-value">${carrito.nombre}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Recolector:</span>
                            <span class="info-value">${recolector}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Grupo:</span>
                            <span class="info-value">${grupo}</span>
                        </div>
                    </div>
                    
                    <div class="productos-box">
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filasProductos}
                                ${carrito.productos.length > 5 ? `
                                    <tr>
                                        <td colspan="4" style="text-align: center; padding: 10px; color: #999; font-style: italic;">
                                            + ${carrito.productos.length - 5} productos más...
                                        </td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="info-box">
                        <div class="metodo-pago">
                            <span class="metodo-label">Método de pago</span>
                            <div class="metodo-opcion">
                                <span class="circulo"></span>
                                <span>Efectivo</span>
                            </div>
                            <div class="metodo-opcion">
                                <span class="circulo circulo-azul"></span>
                                <span>Transferencia</span>
                            </div>
                            <div class="metodo-opcion">
                                <span class="circulo circulo-rosa"></span>
                                <span>Pagado</span>
                            </div>
                            <div class="metodo-opcion">
                                <span class="circulo circulo-amarillo"></span>
                                <span>Pendiente a pagar</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="total-box">
                        <span class="total-label">Total</span>
                        <span class="total-monto">$${(carrito.total || 0).toFixed(2)}</span>
                    </div>
                    
                    <div class="footer">
                        <div class="footer-icono">👍</div>
                        <div class="footer-text">JaLi Bzar</div>
                    </div>
                </div>
            </div>
            
            <div class="botonera">
                <button class="btn-accion" onclick="descargarImagen()">📥 Descargar PNG</button>
                <button class="btn-accion btn-cerrar" onclick="window.close()">❌ Cerrar</button>
            </div>
            
            <script>
                function descargarImagen() {
                    const elemento = document.getElementById('notaCaptura');
                    html2canvas(elemento, {
                        scale: 2,
                        backgroundColor: null,
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    }).then(canvas => {
                        canvas.toBlob(blob => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'JaLi_Bzar_${carrito.nombre}_' + new Date().getTime() + '.png';
                            a.click();
                            URL.revokeObjectURL(url);
                            alert('✅ Imagen descargada exitosamente!');
                        }, 'image/png');
                    }).catch(error => {
                        console.error('Error:', error);
                        alert('⚠️ Error al generar la imagen. Intenta de nuevo.');
                    });
                }
            </script>
        </body>
        </html>
    `);
    
    ventana.document.close();
    sonarExito();
    mostrarNotificacion('📸 Vista previa lista! Descarga cuando quieras', 'success');
}

// Finalizar live y convertir carritos en ventas
function finalizarLive() {
    if (state.carritosLive.length === 0) {
        alert('⚠️ No hay carritos para finalizar');
        return;
    }
    
    const mensaje = `¿Finalizar Live y convertir ${state.carritosLive.length} carritos en ventas?\n\nEsto:\n- Convertirá cada carrito en una venta\n- Limpiará todos los carritos\n- Agregará las ventas a la semana actual`;
    
    if (!confirm(mensaje)) return;
    
    let ventasCreadas = 0;
    
    state.carritosLive.forEach(carrito => {
        if (carrito.productos && carrito.productos.length > 0) {
            // Buscar si el cliente ya existe
            let cliente = state.clientes.find(c => c.nombre.toLowerCase() === carrito.nombre.toLowerCase());
            
            let recolectorVenta = 'Facebook Live';
            let grupoVenta = 'LIVE';
            
            if (cliente && cliente.recolector && cliente.grupo) {
                // Cliente YA EXISTE y tiene recolector asignado
                recolectorVenta = cliente.recolector;
                grupoVenta = cliente.grupo;
            } else if (!cliente) {
                // Cliente NO EXISTE - crear nuevo con tipo Foráneo
                cliente = {
                    id: Date.now() + Math.random(),
                    nombre: carrito.nombre,
                    tipo: 'Foráneo',
                    recolector: 'Facebook Live',
                    grupo: 'LIVE'
                };
                state.clientes.push(cliente);
            }
            
            // Crear venta
            const venta = {
                id: Date.now() + Math.random(),
                fecha: new Date().toISOString(),
                cliente: carrito.nombre,
                recolector: recolectorVenta,
                grupo: grupoVenta,
                pago: 'PENDIENTE',
                productos: [...carrito.productos],
                total: carrito.total || 0,
                cantidad: carrito.productos.reduce((sum, p) => sum + p.cantidad, 0)
            };
            
            state.ventasActuales.push(venta);
            ventasCreadas++;
        }
    });
    
    // Limpiar carritos
    state.carritosLive = [];
    
    // Limpiar formulario rápido
    document.getElementById('quickCliente').value = '';
    
    guardarDatos();
    actualizarCarritosGrid();
    actualizarTablaVentas();
    actualizarListaClientes();
    actualizarDashboard();
    
    sonarExito();
    mostrarNotificacion(`✅ Live finalizado! ${ventasCreadas} ventas creadas`, 'success');
    
    // Cambiar a la vista de ventas
    cambiarSeccion('ventas');
}

// Limpiar todos los carritos (botón de emergencia)
function limpiarTodosLosCarritos() {
    if (state.carritosLive.length === 0) {
        alert('⚠️ No hay carritos para limpiar');
        return;
    }
    
    if (!confirm(`¿Eliminar TODOS los ${state.carritosLive.length} carritos?\n\n⚠️ ADVERTENCIA: Esto NO creará ventas, solo borrará los carritos.`)) {
        return;
    }
    
    state.carritosLive = [];
    
    // Limpiar formulario rápido
    document.getElementById('quickCliente').value = '';
    
    guardarDatos();
    actualizarCarritosGrid();
    sonarClick();
    mostrarNotificacion('🗑️ Todos los carritos eliminados', 'info');
}

// ===== PERSISTENCIA DE DATOS (LocalStorage + Firebase) =====

let timeoutGuardar = null;

function guardarDatos() {
    // Siempre guardar en localStorage inmediatamente
    localStorage.setItem('jali_bzar_data', JSON.stringify(state));
    
    // Debounce para Firebase (esperar 1 segundo antes de sincronizar)
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized) {
        if (timeoutGuardar) {
            clearTimeout(timeoutGuardar);
        }
        timeoutGuardar = setTimeout(() => {
            sincronizarTodo();
        }, 1000);
    }
}

function cargarDatos() {
    // Primero cargar de localStorage
    const datosLocales = localStorage.getItem('jali_bzar_data');
    if (datosLocales) {
        const datosParseados = JSON.parse(datosLocales);
        Object.assign(state, datosParseados);
        
        // Asegurar que carritosLive existe
        if (!state.carritosLive) {
            state.carritosLive = [];
        }
        
        console.log('✅ Datos cargados desde localStorage');
    }
    
    // Luego intentar sincronizar con Firebase
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized) {
        cargarTodoDesdeFirebase();
    }
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#C8E6C9' : tipo === 'error' ? '#FFCDD2' : '#B8E6FF'};
        color: ${tipo === 'success' ? '#2E7D32' : tipo === 'error' ? '#C62828' : '#0277BD'};
        padding: 15px 25px;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 9999;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    notif.textContent = mensaje;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== GENERAR HOJAS DE ENTREGA POR GRUPO =====
function generarHojasEntregaPorGrupo() {
    // Filtrar solo ventas PAGADAS
    const ventasPagadas = state.ventasActuales.filter(v => v.pago === 'PAGADO');
    
    if (ventasPagadas.length === 0) {
        alert('⚠️ No hay ventas con estado PAGADO para generar hojas');
        return;
    }
    
    // Agrupar por GRUPO
    const ventasPorGrupo = {};
    ventasPagadas.forEach(venta => {
        const grupo = venta.grupo || 'SIN GRUPO';
        if (!ventasPorGrupo[grupo]) {
            ventasPorGrupo[grupo] = [];
        }
        ventasPorGrupo[grupo].push(venta);
    });
    
    const grupos = Object.keys(ventasPorGrupo);
    
    if (grupos.length === 0) {
        alert('⚠️ No hay grupos para generar hojas');
        return;
    }
    
    // Si hay un solo grupo, generarlo directamente
    if (grupos.length === 1) {
        generarPDFGrupo(grupos[0], ventasPorGrupo[grupos[0]]);
        sonarExito();
        return;
    }
    
    // Si hay múltiples grupos, mostrar selector
    mostrarSelectorGrupos(grupos, ventasPorGrupo);
}

function mostrarSelectorGrupos(grupos, ventasPorGrupo) {
    // Crear modal personalizado para seleccionar grupo
    const modalHTML = `
        <div id="modalSelectorGrupos" class="modal active" style="z-index: 10000;">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>📄 Selecciona el Grupo</h3>
                    <button class="close-modal" onclick="cerrarSelectorGrupos()">&times;</button>
                </div>
                <div style="padding: 20px;">
                    <p style="margin-bottom: 20px; color: #666;">¿Qué grupo quieres generar?</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${grupos.map(grupo => `
                            <button 
                                class="btn-kawaii btn-info" 
                                style="width: 100%; padding: 15px; font-size: 16px;"
                                onclick="seleccionarGrupoYGenerar('${grupo}')">
                                📋 ${grupo.toUpperCase()} (${ventasPorGrupo[grupo].length} ventas)
                            </button>
                        `).join('')}
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 2px dashed #FFB6D9;">
                        <button 
                            class="btn-kawaii btn-success" 
                            style="width: 100%; padding: 15px;"
                            onclick="generarTodosLosGrupos()">
                            ✨ Generar TODOS los Grupos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insertar modal en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open');
    
    // Guardar datos en variable global temporal
    window.ventasPorGrupoTemp = ventasPorGrupo;
    
    sonarCampana();
}

function cerrarSelectorGrupos() {
    const modal = document.getElementById('modalSelectorGrupos');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
        delete window.ventasPorGrupoTemp;
    }
}

function seleccionarGrupoYGenerar(nombreGrupo) {
    if (window.ventasPorGrupoTemp && window.ventasPorGrupoTemp[nombreGrupo]) {
        generarPDFGrupo(nombreGrupo, window.ventasPorGrupoTemp[nombreGrupo]);
        cerrarSelectorGrupos();
        sonarExito();
        mostrarNotificacion(`✅ Hoja de ${nombreGrupo} generada`, 'success');
    }
}

function generarTodosLosGrupos() {
    if (window.ventasPorGrupoTemp) {
        Object.keys(window.ventasPorGrupoTemp).forEach(grupo => {
            generarPDFGrupo(grupo, window.ventasPorGrupoTemp[grupo]);
        });
        cerrarSelectorGrupos();
        sonarExito();
        mostrarNotificacion(`✅ Se generaron ${Object.keys(window.ventasPorGrupoTemp).length} hojas`, 'success');
    }
}
    
function generarPDFGrupo(nombreGrupo, ventas) {
    const fecha = new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    // Calcular totales generales
    let totalPiezas = 0;
    let totalPaquetes = 0;
    
    // Generar filas de TODAS las ventas del grupo
    const filasHTML = ventas.map(venta => {
        const piezas = venta.productos ? venta.productos.reduce((sum, p) => sum + p.cantidad, 0) : venta.cantidad;
        const paquetes = venta.paquetes || 0;
        
        totalPiezas += piezas;
        totalPaquetes += paquetes;
        
        return `
            <tr>
                <td style="padding: 10px 8px; border: 1px solid #FFB6D9; font-size: 13px;">${venta.cliente}</td>
                <td style="padding: 10px 8px; border: 1px solid #FFB6D9; font-size: 13px; text-align: center;">${venta.recolector}</td>
                <td style="padding: 10px 8px; border: 1px solid #FFB6D9; font-size: 13px; text-align: center; font-weight: 600;">${piezas}</td>
                <td style="padding: 10px 8px; border: 1px solid #FFB6D9; font-size: 13px; text-align: center; font-weight: 600;">${paquetes}</td>
                <td style="padding: 10px 8px; border: 1px solid #FFB6D9; background: white; min-width: 120px;"></td>
            </tr>
        `;
    }).join('');
    
    // Abrir ventana para vista previa y descarga
    const ventana = window.open('', '', 'width=1000,height=1200');
    
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Hoja de Entrega - ${nombreGrupo}</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
                    padding: 20px;
                    background: linear-gradient(135deg, #FFF5F9 0%, #FFE8F0 100%);
                }
                .documento {
                    max-width: 900px;
                    margin: 0 auto;
                    background: white;
                    padding: 35px;
                    box-shadow: 0 10px 40px rgba(255, 105, 180, 0.2);
                    border-radius: 20px;
                    border: 3px solid #FFB6D9;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                    padding: 20px;
                    background: linear-gradient(135deg, #FFF5F9, #FFE8F0);
                    border-radius: 15px;
                    border: 2px solid #FFB6D9;
                }
                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .logo-img {
                    max-width: 150px;
                    max-height: 150px;
                    filter: drop-shadow(0 4px 8px rgba(255, 105, 180, 0.3));
                }
                .info-header {
                    text-align: right;
                }
                .grupo-nombre {
                    font-size: 32px;
                    font-weight: bold;
                    color: #E91E8C;
                    margin-bottom: 8px;
                    text-shadow: 2px 2px 4px rgba(233, 30, 140, 0.1);
                }
                .fecha-box {
                    background: white;
                    padding: 10px 20px;
                    border-radius: 50px;
                    border: 2px solid #FFB6D9;
                    display: inline-block;
                }
                .fecha-icon {
                    font-size: 18px;
                    margin-right: 5px;
                }
                .fecha-text {
                    font-size: 16px;
                    color: #E91E8C;
                    font-weight: bold;
                }
                .estado-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #b871faff, #dab7fcff);
                    color: #720bf8ff;
                    padding: 10px 25px;
                    border-radius: 50px;
                    font-weight: bold;
                    font-size: 16px;
                    margin: 15px 0 25px 0;
                    box-shadow: 0 4px 12px rgba(129, 199, 132, 0.3);
                }
                .decoracion-top {
                    text-align: center;
                    font-size: 28px;
                    margin-bottom: 15px;
                    letter-spacing: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 15px rgba(255, 182, 217, 0.2);
                    border-radius: 10px;
                    overflow: hidden;
                }
                th {
                    background: linear-gradient(135deg, #FFB6D9, #FF8AB8);
                    color: white;
                    padding: 14px 10px;
                    border: none;
                    font-weight: bold;
                    font-size: 14px;
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                td {
                    border: 1px solid #FFB6D9;
                }
                tr:nth-child(even) {
                    background: #FFF5F9;
                }
                tr:hover {
                    background: #FFE8F0;
                }
                .total-row {
                    background: linear-gradient(135deg, #FFE8F0, #FFB6D9) !important;
                    font-weight: bold;
                    font-size: 15px;
                }
                .total-row td {
                    padding: 12px 10px !important;
                    color: #E91E8C;
                    border: 2px solid #FF8AB8;
                }
                .decoracion-bottom {
                    text-align: center;
                    font-size: 24px;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 2px dashed #FFB6D9;
                    color: #FFB6D9;
                }
                .botonera {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 10000;
                }
                .btn-accion {
                    background: linear-gradient(135deg, #FF8AB8, #FFB6D9);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 50px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(255, 138, 184, 0.4);
                    transition: transform 0.2s;
                    font-family: 'Comic Sans MS', sans-serif;
                }
                .btn-accion:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(255, 138, 184, 0.5);
                }
                .btn-cerrar {
                    background: linear-gradient(135deg, #E0E0E0, #BDBDBD);
                    color: #333;
                }
                @media print {
                    .botonera { display: none; }
                    body { 
                        background: white; 
                        padding: 0; 
                    }
                    .documento { 
                        box-shadow: none;
                        border: none;
                    }
                }
            </style>
        </head>
        <body>
            <div id="contenidoPDF">
                <div class="documento">
                    <div class="decoracion-top">🌸 ✨ 💗 ✨ 🌸</div>
                    
                    <div class="header">
                        <div class="logo-section">
                            <img src="./logo.png" alt="JaLi Bzar" class="logo-img">
                        </div>
                        <div class="info-header">
                            <div class="grupo-nombre">${nombreGrupo.toUpperCase()}</div>
                            <div class="fecha-box">
                                <span class="fecha-icon">📅</span>
                                <span class="fecha-text">${fecha}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="estado-badge">♥JaLi Bzar♥</div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 30%;">👤 Nombre del Cliente</th>
                                <th style="width: 20%;">🚚 Recolector</th>
                                <th style="width: 10%;">📦 Piezas</th>
                                <th style="width: 10%;">📋 Paquetes</th>
                                <th style="width: 30%;">✍️ Firma</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasHTML}
                            <tr class="total-row">
                                <td colspan="2" style="text-align: right; font-size: 15px;">💰 TOTAL:</td>
                                <td style="text-align: center; font-size: 15px;">${totalPiezas}</td>
                                <td style="text-align: center; font-size: 15px;">${totalPaquetes}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="decoracion-bottom">💝 ✨ 🎀 ✨ 💝</div>
                </div>
            </div>
            
            <div class="botonera">
                <button class="btn-accion" onclick="descargarPDF()">📥 Descargar PDF</button>
                <button class="btn-accion" onclick="imprimirHoja()">🖨️ Imprimir</button>
                <button class="btn-accion btn-cerrar" onclick="window.close()">❌ Cerrar</button>
            </div>
            
            <script>
                function descargarPDF() {
                    const elemento = document.getElementById('contenidoPDF');
                    const opciones = {
                        margin: 10,
                        filename: 'JaLi_Bzar_${nombreGrupo}_${fecha.replace(/\//g, '-')}.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };
                    
                    html2pdf().set(opciones).from(elemento).save().then(() => {
                        alert('✅ PDF descargado exitosamente!');
                    });
                }
                
                function imprimirHoja() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    
    ventana.document.close();
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


