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
    productosTemporal: [] // Array temporal para múltiples productos
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
    document.getElementById('btnAgregarProducto').addEventListener('click', agregarProductoALista);

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
    document.getElementById('ventaCliente').addEventListener('change', actualizarGrupoVenta);
    document.getElementById('ventaRecolector').addEventListener('change', actualizarGrupoVenta);

    // Impresión de ticket
    document.getElementById('btnImprimirTicket').addEventListener('click', imprimirTicket);

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
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
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
}

// ===== GESTIÓN DE CLIENTES =====
function guardarCliente(e) {
    e.preventDefault();

    const cliente = {
        id: Date.now(),
        nombre: document.getElementById('nombreCliente').value.trim(),
        grupo: document.getElementById('grupoCliente').value.trim(),
        tipo: document.getElementById('tipoCliente').value
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
            <p><strong>Grupo:</strong> ${cliente.grupo}</p>
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

    // Limpiar y llenar selector de clientes
    selectCliente.innerHTML = '<option value="">Seleccionar cliente...</option>';
    state.clientes.forEach(cliente => {
        selectCliente.innerHTML += `<option value="${cliente.id}" data-grupo="${cliente.grupo}">${cliente.nombre}</option>`;
    });

    // Limpiar y llenar selector de recolectores
    selectRecolector.innerHTML = '<option value="">Seleccionar recolector...</option>';
    state.recolectores.forEach(recolector => {
        selectRecolector.innerHTML += `<option value="${recolector.id}" data-grupo="${recolector.grupo}">${recolector.nombre}</option>`;
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
    state.productosTemporal = [];
    state.ventaEnEdicion = null; // IMPORTANTE: Resetear estado de edición
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
    const selectCliente = document.getElementById('ventaCliente');
    const selectRecolector = document.getElementById('ventaRecolector');
    const inputGrupo = document.getElementById('ventaGrupo');

    const clienteOption = selectCliente.options[selectCliente.selectedIndex];
    const recolectorOption = selectRecolector.options[selectRecolector.selectedIndex];

    // Priorizar el grupo del cliente si está seleccionado
    if (clienteOption && clienteOption.dataset.grupo) {
        inputGrupo.value = clienteOption.dataset.grupo;
    } else if (recolectorOption && recolectorOption.dataset.grupo) {
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
                <td colspan="9" style="text-align: center; padding: 40px; color: #999;">
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
                <td>${venta.productos ? venta.productos.reduce((sum, p) => sum + p.cantidad, 0) : venta.cantidad}</td>
                <td>-</td>
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

// ===== PERSISTENCIA DE DATOS (LocalStorage + Firebase) =====
function guardarDatos() {
    // Siempre guardar en localStorage como backup
    localStorage.setItem('jali_bzar_data', JSON.stringify(state));
    
    // Sincronizar con Firebase si está disponible
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized) {
        sincronizarTodo();
    }
}

function cargarDatos() {
    // Primero cargar de localStorage
    const datosLocales = localStorage.getItem('jali_bzar_data');
    if (datosLocales) {
        const datosParseados = JSON.parse(datosLocales);
        Object.assign(state, datosParseados);
        console.log('✅ Datos cargados desde localStorage');
    }
    
    // Luego intentar sincronizar con Firebase
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized) {
        cargarTodoDesdeFirebase().then((cargado) => {
            if (cargado) {
                // Actualizar interfaz después de cargar desde Firebase
                actualizarDashboard();
                actualizarTablaVentas();
                actualizarListaClientes();
                actualizarListaRecolectores();
                actualizarHistorial();
            }
        });
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
