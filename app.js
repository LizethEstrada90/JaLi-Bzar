console.log('🛡️ Iniciando parche de seguridad para productos...');
// ===== SISTEMA JALI BZAR - CÓDIGO COMPLETO MEJORADO =====

// ===== 🚫 BLOQUEAR NOTIFICACIONES AGRESIVAMENTE =====
(function() {
    // Interceptar appendChild para bloquear notificaciones
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(child) {
        // Si es un elemento con texto que incluye "Sincronizado", bloquearlo
        if (child && child.textContent) {
            const text = child.textContent.toLowerCase();
            if (text.includes('sincronizado') || 
                text.includes('guardado') ||
                text.includes('firebase') ||
                text.includes('sync')) {
                return child; // No agregarlo al DOM
            }
        }
        return originalAppendChild.call(this, child);
    };
    
    // Observador de mutaciones para eliminar notificaciones que aparezcan
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Es un elemento
                    const text = node.textContent?.toLowerCase() || '';
                    if (text.includes('sincronizado') || 
                        text.includes('guardado') ||
                        text.includes('firebase') ||
                        text.includes('sync')) {
                        node.remove();
                    }
                }
            });
        });
    });
    
    // Observar cambios en el body
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

// ===== ✨ NUEVAS FUNCIONALIDADES =====

/**
 * 🔍 BÚSQUEDA EN TIEMPO REAL DE CLIENTES EN TABLA DE VENTAS
 */
let ventasFiltradas = []; // Array para almacenar ventas filtradas

function inicializarBuscador() {
    const inputBuscar = document.getElementById('buscarCliente');
    const btnLimpiar = document.getElementById('btnLimpiarBusqueda');
    
    if (!inputBuscar) return;
    
    inputBuscar.addEventListener('input', function() {
        const termino = this.value.trim().toLowerCase();
        
        if (termino.length > 0) {
            // Mostrar botón de limpiar
            btnLimpiar.style.display = 'inline-block';
            
            // Filtrar ventas por nombre de cliente
            ventasFiltradas = state.ventasActuales.filter(venta => 
                venta.cliente.toLowerCase().includes(termino)
            );
            
            // Actualizar tabla con resultados filtrados
            actualizarTablaVentas(ventasFiltradas);
            
            // Mostrar mensaje si no hay resultados
            if (ventasFiltradas.length === 0) {
                const tbody = document.getElementById('ventasBody');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                            <p style="font-size: 1.5rem;">🔍</p>
                            <p>No se encontraron clientes con "${termino}"</p>
                        </td>
                    </tr>
                `;
                document.getElementById('totalVentas').textContent = '$0.00';
            }
        } else {
            // Si no hay búsqueda, mostrar todas las ventas
            btnLimpiar.style.display = 'none';
            ventasFiltradas = [];
            actualizarTablaVentas();
        }
    });
    
    // Botón limpiar búsqueda
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', function() {
            inputBuscar.value = '';
            btnLimpiar.style.display = 'none';
            ventasFiltradas = [];
            actualizarTablaVentas();
            inputBuscar.focus();
        });
    }
}

/**
 * ✨ NUEVO: Buscador de clientes en modal de ventas
 */
function inicializarBuscadorModal() {
    const inputBuscarModal = document.getElementById('buscarClienteModal');
    const selectCliente = document.getElementById('ventaCliente');
    
    if (!inputBuscarModal || !selectCliente) return;
    
    inputBuscarModal.addEventListener('input', function() {
        const termino = this.value.trim().toLowerCase();
        
        // Filtrar opciones del select
        const opciones = Array.from(selectCliente.options);
        
        opciones.forEach((opcion, index) => {
            if (index === 0) {
                // Mantener la primera opción "Seleccionar cliente..."
                opcion.style.display = 'block';
                return;
            }
            
            const nombreCliente = opcion.textContent.toLowerCase();
            
            if (nombreCliente.includes(termino)) {
                opcion.style.display = 'block';
            } else {
                opcion.style.display = 'none';
            }
        });
        
        // Si hay solo una coincidencia (además de la opción default), seleccionarla automáticamente
        const opcionesVisibles = opciones.filter((op, idx) => idx > 0 && op.style.display !== 'none');
        if (opcionesVisibles.length === 1) {
            selectCliente.value = opcionesVisibles[0].value;
            // Trigger cambio para actualizar recolector y grupo
            autoCompletarDesdeCliente();
        }
    });
    
    // Limpiar búsqueda al abrir el select
    selectCliente.addEventListener('focus', function() {
        inputBuscarModal.focus();
    });
}

/**
 * 🔍 BUSCADOR PREDICTIVO TIPO GOOGLE PARA CLIENTES EN MODAL DE VENTAS
 */
let indiceSugerenciaActual = -1;

function inicializarBuscadoresVenta() {
    const inputBuscar = document.getElementById('buscarClienteVenta');
    const dropdownSugerencias = document.getElementById('sugerenciasClientes');
    const hiddenInput = document.getElementById('ventaCliente');
    
    if (!inputBuscar || !dropdownSugerencias) return;
    
    // Escuchar mientras escribe
    inputBuscar.addEventListener('input', function() {
        const termino = this.value.trim().toLowerCase();
        hiddenInput.value = ''; // Limpiar selección previa
        indiceSugerenciaActual = -1;
        
        if (termino.length === 0) {
            dropdownSugerencias.innerHTML = '';
            dropdownSugerencias.classList.remove('show');
            return;
        }
        
        // Filtrar clientes que coincidan
        const clientesFiltrados = state.clientes.filter(cliente => 
            cliente.nombre.toLowerCase().includes(termino)
        );
        
        if (clientesFiltrados.length === 0) {
            dropdownSugerencias.innerHTML = '<div class="autocomplete-item no-results">😕 No se encontró ese cliente</div>';
            dropdownSugerencias.classList.add('show');
            return;
        }
        
        // Mostrar sugerencias
        dropdownSugerencias.innerHTML = clientesFiltrados
            .slice(0, 8) // Máximo 8 sugerencias
            .map((cliente, index) => {
                const nombreResaltado = resaltarCoincidencia(cliente.nombre, termino);
                const recolector = state.recolectores.find(r => r.id === cliente.recolectorId);
                const nombreRecolector = recolector ? recolector.nombre : 'Sin asignar';
                const grupoCliente = cliente.grupo || 'Sin grupo';
                
                return `
                    <div class="autocomplete-item" data-cliente-id="${cliente.id}" data-index="${index}">
                        <div class="autocomplete-nombre">${nombreResaltado}</div>
                        <div class="autocomplete-info">Recolector: ${nombreRecolector} • ${grupoCliente}</div>
                    </div>
                `;
            })
            .join('');
        
        dropdownSugerencias.classList.add('show');
    });
    
    // ✨ EVENT DELEGATION para el click en sugerencias (ARREGLO)
    // En la parte del click en sugerencias, asegúrate que dice:
dropdownSugerencias.addEventListener('click', function(e) {
    const item = e.target.closest('.autocomplete-item');
    
    if (!item || item.classList.contains('no-results')) return;
    
    const clienteId = parseInt(item.dataset.clienteId);
    const cliente = state.clientes.find(c => c.id === clienteId);
    
    if (cliente) {
        // Actualizar el input visible
        inputBuscar.value = cliente.nombre;
        
        // Actualizar el input hidden
        hiddenInput.value = clienteId;
        
        // ⭐ LLAMAR A LA FUNCIÓN MÁGICA
        autoCompletarDesdeCliente();
        
        // Cerrar dropdown
        dropdownSugerencias.classList.remove('show');
    }
});

    
    // Navegación con teclado (flechas arriba/abajo y Enter)
    inputBuscar.addEventListener('keydown', function(e) {
        const items = document.querySelectorAll('.autocomplete-item:not(.no-results)');
        
        if (items.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            indiceSugerenciaActual = (indiceSugerenciaActual + 1) % items.length;
            actualizarSeleccionSugerencia(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            indiceSugerenciaActual = indiceSugerenciaActual <= 0 ? items.length - 1 : indiceSugerenciaActual - 1;
            actualizarSeleccionSugerencia(items);
        } else if (e.key === 'Enter' && indiceSugerenciaActual >= 0) {
            e.preventDefault();
            items[indiceSugerenciaActual].click();
        } else if (e.key === 'Escape') {
            dropdownSugerencias.classList.remove('show');
            indiceSugerenciaActual = -1;
        }
    });
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!inputBuscar.contains(e.target) && !dropdownSugerencias.contains(e.target)) {
            dropdownSugerencias.classList.remove('show');
            indiceSugerenciaActual = -1;
        }
    });
}

// Resaltar texto coincidente
function resaltarCoincidencia(texto, busqueda) {
    const regex = new RegExp(`(${busqueda})`, 'gi');
    return texto.replace(regex, '<strong class="highlight">$1</strong>');
}

// Actualizar visualmente la sugerencia seleccionada con teclado
function actualizarSeleccionSugerencia(items) {
    items.forEach((item, index) => {
        if (index === indiceSugerenciaActual) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
}

/**
 * ✏️ EDITAR CLIENTES - Poder cambiar recolector y grupo
 */
let clienteEnEdicion = null;

function editarCliente(id) {
    const cliente = state.clientes.find(c => c.id === id);
    if (!cliente) return;
    
    clienteEnEdicion = id;
    
    // Abrir modal de edición
    abrirModal('modalEditarCliente');
    
    // Actualizar selector de recolectores
    actualizarSelectRecolectoresEdicion();
    
    // Llenar datos del cliente
    document.getElementById('editarNombreCliente').value = cliente.nombre;
    document.getElementById('editarTipoCliente').value = cliente.tipo;
    
    // Seleccionar recolector si existe
    if (cliente.recolectorId) {
        document.getElementById('editarRecolectorCliente').value = cliente.recolectorId;
    }
    
    // Actualizar grupo automáticamente
    actualizarGrupoClienteEdicion();
}

function actualizarSelectRecolectoresEdicion() {
    const select = document.getElementById('editarRecolectorCliente');
    select.innerHTML = '<option value="">Seleccionar recolector...</option>';
    
    state.recolectores.forEach(recolector => {
        select.innerHTML += `<option value="${recolector.id}" data-grupo="${recolector.grupo || ''}">${recolector.nombre} - ${recolector.grupo || 'Sin grupo'}</option>`;
    });
}

function actualizarGrupoClienteEdicion() {
    const select = document.getElementById('editarRecolectorCliente');
    const inputGrupo = document.getElementById('editarGrupoCliente');
    
    const option = select.options[select.selectedIndex];
    
    if (option && option.dataset.grupo) {
        inputGrupo.value = option.dataset.grupo;
    } else {
        inputGrupo.value = '';
    }
}

function guardarEdicionCliente(e) {
    e.preventDefault();
    
    if (!clienteEnEdicion) return;
    
    const recolectorId = document.getElementById('editarRecolectorCliente').value;
    const recolector = state.recolectores.find(r => r.id == recolectorId);
    
    // Encontrar el cliente y actualizarlo
    const cliente = state.clientes.find(c => c.id === clienteEnEdicion);
    if (cliente) {
        cliente.nombre = document.getElementById('editarNombreCliente').value.trim();
        cliente.tipo = document.getElementById('editarTipoCliente').value;
        cliente.recolectorId = recolectorId;
        cliente.recolector = recolector ? recolector.nombre : '';
        cliente.grupo = recolector ? recolector.grupo : '';
        
        guardarDatos();
        actualizarListaClientes();
        actualizarDashboard();
        cerrarModal('modalEditarCliente');
        
        clienteEnEdicion = null;
        
        sonarExito();
        mostrarNotificacion('Cliente actualizado exitosamente ✨', 'success');
    }
}

// ===== SONIDOS KAWAII PARA BOTONES =====
const sonidos = {
    click: null,
    success: null,
    error: null,
    pop: null
};

// Crear contexto de audio
let audioContext = null;

function inicializarAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function sonarClick() {
    inicializarAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function sonarExito() {
    inicializarAudio();
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator1.frequency.value = 523.25;
    oscillator2.frequency.value = 659.25;
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.3);
    oscillator2.stop(audioContext.currentTime + 0.3);
}

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

function sonarCampana() {
    inicializarAudio();
    const frequencies = [1046.50, 1318.51, 1567.98];
    
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

function agregarSonidosBotones() {
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
    productosTemporal: [],
    carritosLive: [],
    carritoActual: null
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    if (typeof initFirebase !== 'undefined') {
        const configurado = verificarConfiguracionFirebase();
        if (configurado) {
            initFirebase();
            // Inicializado sin notificaciones
        } else {
            console.warn('⚠️ Firebase no configurado. Sistema funcionará solo localmente.');
        }
    }
    
    cargarDatos();
    inicializarEventos();
    actualizarDashboard();
    actualizarTablaVentas();
    actualizarListaClientes();
    actualizarListaRecolectores();
    actualizarHistorial();
    actualizarCarritosGrid();
    
    // ✨ Inicializar buscador de clientes
    inicializarBuscador();
    
    // ✨ Inicializar buscadores en modal de ventas
    inicializarBuscadoresVenta();
    
    setTimeout(() => {
        agregarSonidosBotones();
    }, 500);
});

// ===== NAVEGACIÓN ENTRE SECCIONES =====
function inicializarEventos() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => cambiarSeccion(btn.dataset.section));
    });

    document.getElementById('btnAgregarCliente').addEventListener('click', () => abrirModal('modalCliente'));
    document.getElementById('btnAgregarRecolector').addEventListener('click', () => abrirModal('modalRecolector'));
    document.getElementById('btnAgregarVenta').addEventListener('click', () => abrirModal('modalVenta'));
    document.getElementById('btnNuevaSemana').addEventListener('click', crearNuevaSemana);
    document.getElementById('btnGenerarHojasPagados').addEventListener('click', generarHojasEntregaPorGrupo);
    document.getElementById('btnAgregarProducto').addEventListener('click', agregarProductoALista);
    
    document.getElementById('btnAgregarClienteRapido').addEventListener('click', agregarClienteRapidoLive);
    document.getElementById('btnAgregarAlCarrito').addEventListener('click', agregarProductoAlCarrito);
    document.getElementById('btnImprimirCarrito').addEventListener('click', imprimirTicketCarrito);
    document.getElementById('btnGenerarImagen').addEventListener('click', generarImagenCute);
    document.getElementById('btnFinalizarLive').addEventListener('click', finalizarLive);
    document.getElementById('btnLimpiarCarritos').addEventListener('click', limpiarTodosLosCarritos);
    
    document.getElementById('quickCliente').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            agregarClienteRapidoLive();
        }
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) cerrarModal(modal.id);
        });
    });

    document.getElementById('formCliente').addEventListener('submit', guardarCliente);
    document.getElementById('formRecolector').addEventListener('submit', guardarRecolector);
    document.getElementById('formVenta').addEventListener('submit', guardarVenta);
    
    // ✨ NUEVO: Form para editar cliente
    document.getElementById('formEditarCliente').addEventListener('submit', guardarEdicionCliente);
    document.getElementById('editarRecolectorCliente').addEventListener('change', actualizarGrupoClienteEdicion);

    document.getElementById('ventaCliente').addEventListener('change', autoCompletarDesdeCliente);
    document.getElementById('ventaRecolector').addEventListener('change', actualizarGrupoVenta);
    document.getElementById('recolectorCliente').addEventListener('change', actualizarGrupoCliente);

    document.getElementById('btnImprimirTicket').addEventListener('click', imprimirTicket);
    document.getElementById('btnGenerarImagenVenta').addEventListener('click', generarImagenDesdeVenta);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal(modal.id);
        });
    });
}

function autoCompletarDesdeCliente() {
    const clienteId = parseInt(document.getElementById('ventaCliente').value);
    
    if (!clienteId) {
        document.getElementById('ventaRecolector').value = '';
        document.getElementById('ventaGrupo').value = '';
        return;
    }
    
    const cliente = state.clientes.find(c => c.id === clienteId);
    
    if (cliente && cliente.recolectorId) {
        document.getElementById('ventaRecolector').value = cliente.recolectorId;
        // También llenar el grupo directamente desde el cliente
        document.getElementById('ventaGrupo').value = cliente.grupo || '';
    }
}

// ========================================
// 🔒 MODIFICACIÓN 6: Limpiar al cambiar de sección
// ========================================
// REEMPLAZA tu función cambiarSeccion() con esta versión:

function cambiarSeccion(seccion) {
    console.log('📍 Cambiando a sección:', seccion);
    
    // 🛡️ AL CAMBIAR DE SECCIÓN, LIMPIAR ESTADO TEMPORAL
    if (state.productosTemporal && state.productosTemporal.length > 0) {
        console.log('🧹 Limpiando productos temporales al cambiar sección');
        state.productosTemporal = [];
        state.ventaEnEdicion = null;
    }
    
    // Actualizar botones activos en AMBOS menús (desktop y móvil)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === seccion) {
            btn.classList.add('active');
        }
    });

    // Cambiar sección visible
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(seccion).classList.add('active');

    // Siempre mostrar el header cuando se cambia de sección
    const headerPrincipal = document.getElementById('headerPrincipal');
    if (headerPrincipal) {
        headerPrincipal.style.display = 'block';
    }

    // Scroll al inicio
    window.scrollTo(0, 0);

    // Actualizar dashboard si es necesario
    if (seccion === 'dashboard') {
        actualizarDashboard();
    }
}


// ========================================
// 🔒 MODIFICACIÓN 2: Mejorar abrirModal()
// ========================================
// REEMPLAZA tu función abrirModal() con esta versión:

function abrirModal(modalId) {
    console.log('🔓 Abriendo modal:', modalId);
    
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    document.body.classList.add('modal-open');
    sonarCampana();

    if (modalId === 'modalVenta') {
        actualizarSelectoresVenta();
        
        // 🛡️ SIEMPRE LIMPIAR AL ABRIR NUEVA VENTA
        // (Solo NO limpiar si estamos editando una venta existente)
        if (!state.ventaEnEdicion) {
            console.log('🧹 Nueva venta - Limpiando todo...');
            limpiarFormularioVentaCompleto();
        } else {
            console.log('✏️ Editando venta existente - NO limpiar');
        }
    }
    
    if (modalId === 'modalCliente') {
        actualizarSelectRecolectoresCliente();
    }
}
// ========================================
// 🔒 MODIFICACIÓN 1: Mejorar cerrarModal()
// ========================================
// REEMPLAZA tu función cerrarModal() con esta versión más segura:

function cerrarModal(modalId) {
    console.log('🔒 Cerrando modal:', modalId);
    
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    document.body.classList.remove('modal-open');
    sonarClick();
    
    const form = modal.querySelector('form');
    if (form) form.reset();
    
    // 🛡️ LIMPIEZA AGRESIVA AL CERRAR MODAL DE VENTAS
    if (modalId === 'modalVenta') {
        console.log('🧹 Limpiando estado de venta...');
        
        // Limpiar estado
        state.ventaEnEdicion = null;
        state.productosTemporal = [];
        
        // Limpiar visualmente
        document.getElementById('tituloModalVenta').textContent = 'Nueva Venta 🛍️';
        document.getElementById('listaProductos').innerHTML = '<p style="text-align: center; color: #999; padding: 20px;" id="msgSinProductos">No hay productos agregados</p>';
        document.getElementById('totalVentaModal').textContent = '$0.00';
        
        // 💰 Limpiar anticipo
        const anticipoInput = document.getElementById('anticipo');
        if (anticipoInput) {
            anticipoInput.value = '0';
        }
        
        // Limpiar todos los campos del formulario
        document.getElementById('ventaCliente').value = '';
        document.getElementById('ventaRecolector').value = '';
        document.getElementById('ventaGrupo').value = '';
        document.getElementById('ventaPaquetes').value = '';
        document.getElementById('ventaPago').value = '';
        
        console.log('✅ Estado limpio:', {
            ventaEnEdicion: state.ventaEnEdicion,
            productosTemp: state.productosTemporal.length,
            anticipo: anticipoInput ? anticipoInput.value : '0'
        });
    }
    
    if (modalId === 'modalCarrito') {
        state.carritoActual = null;
    }
    
    if (modalId === 'modalEditarCliente') {
        clienteEnEdicion = null;
    }
}
// ===== GESTIÓN DE CLIENTES =====
function actualizarSelectRecolectoresCliente() {
    const select = document.getElementById('recolectorCliente');
    select.innerHTML = '<option value="">Seleccionar recolector...</option>';
    
    state.recolectores.forEach(recolector => {
        select.innerHTML += `<option value="${recolector.id}" data-grupo="${recolector.grupo || ''}">${recolector.nombre} - ${recolector.grupo || 'Sin grupo'}</option>`;
    });
}

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
                <button class="btn-edit" onclick="editarCliente(${cliente.id})">
                    ✏️ Editar
                </button>
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

    selectCliente.innerHTML = '<option value="">Seleccionar cliente...</option>';
    state.clientes.forEach(cliente => {
        selectCliente.innerHTML += `<option value="${cliente.id}">${cliente.nombre}</option>`;
    });

    selectRecolector.innerHTML = '<option value="">Seleccionar recolector...</option>';
    state.recolectores.forEach(recolector => {
        selectRecolector.innerHTML += `<option value="${recolector.id}" data-grupo="${recolector.grupo || ''}">${recolector.nombre}</option>`;
    });
}

// ========================================
// 🔒 MODIFICACIÓN 5: Validación antes de agregar productos
// ========================================
// REEMPLAZA tu función agregarProductoALista() con esta versión:

function agregarProductoALista() {
    const nombre = document.getElementById('nombreProducto').value.trim();
    const cantidad = parseFloat(document.getElementById('cantidadProducto').value) || 0;
    const precio = parseFloat(document.getElementById('precioProducto').value) || 0;

    if (!nombre || cantidad <= 0 || precio <= 0) {
        alert('⚠️ Por favor llena todos los campos del producto');
        return;
    }
    
    // 🛡️ VALIDACIÓN: Verificar que NO estemos editando otra venta por error
    const modalVenta = document.getElementById('modalVenta');
    if (!modalVenta || !modalVenta.classList.contains('active')) {
        console.error('❌ ERROR: Modal no está activo, no agregar producto');
        return;
    }

    const producto = {
        id: Date.now() + Math.random(), // 🛡️ ID único garantizado
        nombre: nombre,
        cantidad: cantidad,
        precioUnitario: precio,
        subtotal: cantidad * precio
    };
    
    console.log('➕ Agregando producto:', producto);

    state.productosTemporal.push(producto);
    
    document.getElementById('nombreProducto').value = '';
    document.getElementById('cantidadProducto').value = '1';
    document.getElementById('precioProducto').value = '';
    
    sonarPop();
    actualizarListaProductosModal();
    
    console.log('✅ Producto agregado. Total productos:', state.productosTemporal.length);
}
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
    
    const total = state.productosTemporal.reduce((sum, p) => sum + p.subtotal, 0);
    document.getElementById('totalVentaModal').textContent = `$${total.toFixed(2)}`;
}

function eliminarProductoTemporal(id) {
    state.productosTemporal = state.productosTemporal.filter(p => p.id !== id);
    sonarClick();
    actualizarListaProductosModal();
}

// ========================================
// 🔒 MODIFICACIÓN 4: Mejorar limpiarFormularioVenta() existente
// ========================================
// REEMPLAZA tu función limpiarFormularioVenta() con esta:

function limpiarFormularioVenta() {
    // Usar la nueva función ultra segura
    limpiarFormularioVentaCompleto();
}

// ========================================
// 📝 MODIFICACIÓN 4: editarVenta()
// ========================================
// Reemplaza la función editarVenta() para que cargue el anticipo

function editarVenta(id) {
    const venta = state.ventasActuales.find(v => v.id === id);
    if (!venta) return;
    
    state.ventaEnEdicion = id;
    abrirModal('modalVenta');
    document.getElementById('tituloModalVenta').textContent = 'Editar Venta ✏️';
    
    const clienteId = state.clientes.find(c => c.nombre === venta.cliente)?.id || '';
    const recolectorId = state.recolectores.find(r => r.nombre === venta.recolector)?.id || '';
    
    document.getElementById('ventaCliente').value = clienteId;
    document.getElementById('ventaRecolector').value = recolectorId;
    document.getElementById('ventaGrupo').value = venta.grupo;
    document.getElementById('ventaPaquetes').value = venta.paquetes || 0;
    document.getElementById('ventaPago').value = venta.pago;
    
    // 💰 CARGAR EL ANTICIPO SI EXISTE
    setTimeout(() => {
        const anticipoInput = document.getElementById('anticipo');
        if (anticipoInput && venta.anticipo) {
            anticipoInput.value = venta.anticipo;
        }
    }, 500);
    
    if (venta.productos && venta.productos.length > 0) {
        state.productosTemporal = venta.productos.map(p => ({
            ...p,
            id: p.id || Date.now() + Math.random()
        }));
    } else {
        state.productosTemporal = [{
            id: Date.now(),
            nombre: venta.producto || 'Producto',
            cantidad: venta.cantidad || 1,
            precioUnitario: venta.precioUnitario || 0,
            subtotal: venta.total || 0
        }];
    }
    
    actualizarListaProductosModal();
    actualizarGrupoVenta();
}

function actualizarGrupoVenta() {
    const selectRecolector = document.getElementById('ventaRecolector');
    const inputGrupo = document.getElementById('ventaGrupo');

    const recolectorOption = selectRecolector.options[selectRecolector.selectedIndex];

    if (recolectorOption && recolectorOption.dataset.grupo) {
        inputGrupo.value = recolectorOption.dataset.grupo;
    } else {
        inputGrupo.value = '';
    }
}

function guardarVenta(e) {
    e.preventDefault();
    
    // 🛡️ VALIDACIÓN: Verificar que hay productos temporales
    console.log('💾 Intentando guardar venta...');
    console.log('Productos temporales:', state.productosTemporal.length);
    console.log('Modo edición:', state.ventaEnEdicion);
    
    if (!state.productosTemporal || state.productosTemporal.length === 0) {
        alert('⚠️ No hay productos para guardar. Por favor agrega al menos un producto.');
        console.error('❌ ERROR: No hay productos en state.productosTemporal');
        return;
    }

    const clienteId = parseInt(document.getElementById('ventaCliente').value);
    const recolectorId = parseInt(document.getElementById('ventaRecolector').value);
    
    if (!clienteId || !recolectorId) {
        alert('⚠️ Selecciona un cliente y un recolector');
        return;
    }
    }
// ========================================
// 💾 MODIFICACIÓN 3: guardarVenta()
// ========================================
// Reemplaza la función guardarVenta() para que guarde el anticipo

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

    const ahora = new Date().toISOString();
    
    // 💰 OBTENER EL ANTICIPO DEL CAMPO
    const anticipoInput = document.getElementById('anticipo');
    const anticipo = anticipoInput ? parseFloat(anticipoInput.value) || 0 : 0;
    
    const venta = {
        id: state.ventaEnEdicion || Date.now(),
        fechaCreacion: state.ventaEnEdicion 
            ? state.ventasActuales.find(v => v.id === state.ventaEnEdicion)?.fechaCreacion || ahora
            : ahora,
        fechaModificacion: ahora,
        fecha: ahora,
        cliente: cliente ? cliente.nombre : '',
        recolector: recolector ? recolector.nombre : '',
        grupo: document.getElementById('ventaGrupo').value,
        pago: document.getElementById('ventaPago').value,
        paquetes: parseInt(document.getElementById('ventaPaquetes').value) || 0,
        productos: [...state.productosTemporal],
        total: state.productosTemporal.reduce((sum, p) => sum + p.subtotal, 0),
        cantidad: state.productosTemporal.reduce((sum, p) => sum + p.cantidad, 0),
        anticipo: anticipo // 💰 GUARDAR EL ANTICIPO
    };

    if (state.ventaEnEdicion) {
        const index = state.ventasActuales.findIndex(v => v.id === state.ventaEnEdicion);
        if (index !== -1) {
            state.ventasActuales[index] = venta;
            mostrarNotificacion('Venta actualizada exitosamente ✨', 'success');
        }
    } else {
        state.ventasActuales.push(venta);
        mostrarNotificacion('Venta registrada exitosamente ✨', 'success');
    }

    guardarDatos();
    actualizarTablaVentas();
    actualizarDashboard();
    cerrarModal('modalVenta');

    sonarExito();
    
    state.ventaEnEdicion = null;
    limpiarFormularioVenta();
}


function actualizarTablaVentas(ventasAMostrar = null) {
    const tbody = document.getElementById('ventasBody');
    const ventas = ventasAMostrar || state.ventasActuales;
    
    if (ventas.length === 0) {
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

    tbody.innerHTML = ventas.map(venta => {
        const pagoClass = venta.pago === 'PENDIENTE' ? 'pago-pendiente' :
                         venta.pago === 'PAGADO' ? 'pago-pagado' : 'pago-no-realizo';
        
        let productoDisplay = '';
        if (venta.productos && venta.productos.length > 0) {
            productoDisplay = venta.productos.map(p => 
                `${p.nombre} (${p.cantidad}x $${p.precioUnitario.toFixed(2)})`
            ).join('<br>');
        } else {
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

    const total = ventas.reduce((sum, v) => sum + v.total, 0);
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
    const ventasHoy = state.ventasActuales.filter(v => {
        const fechaVenta = v.fechaCreacion || v.fecha;
        return new Date(fechaVenta).toDateString() === hoy;
    });
    
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
}

function crearGraficaVentasDia() {
    const ctx = document.getElementById('chartVentasDia');
    if (!ctx) return;

    if (window.chartVentasDia instanceof Chart) {
        window.chartVentasDia.destroy();
    }

    const ventasPorDia = {};
    state.ventasActuales.forEach(venta => {
        const fecha = new Date(venta.fecha).toLocaleDateString('es-MX', { 
            month: 'short', 
            day: 'numeric' 
        });
        ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + venta.total;
    });

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

    if (window.chartTopClientes instanceof Chart) {
        window.chartTopClientes.destroy();
    }

    const ventasPorCliente = {};
    state.ventasActuales.forEach(venta => {
        ventasPorCliente[venta.cliente] = (ventasPorCliente[venta.cliente] || 0) + venta.total;
    });

    const top5 = Object.entries(ventasPorCliente)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

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
                        color: '#E91E8C',
                        font: {
                            size: window.innerWidth < 768 ? 9 : 12
                        },
                        maxRotation: window.innerWidth < 768 ? 45 : 0,
                        minRotation: window.innerWidth < 768 ? 45 : 0,
                        callback: function(value, index) {
                            const label = this.getLabelForValue(value);
                            if (window.innerWidth < 768 && label.length > 12) {
                                return label.substring(0, 10) + '...';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function crearGraficaRecolectores() {
    const ctx = document.getElementById('chartRecolectores');
    if (!ctx) return;

    if (window.chartRecolectores instanceof Chart) {
        window.chartRecolectores.destroy();
    }

    const ventasPorRecolector = {};
    state.ventasActuales.forEach(venta => {
        ventasPorRecolector[venta.recolector] = (ventasPorRecolector[venta.recolector] || 0) + venta.total;
    });

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
                    align: 'center',
                    labels: {
                        color: '#E91E8C',
                        font: { 
                            size: window.innerWidth < 768 ? 10 : 11,
                            weight: 'bold' 
                        },
                        padding: window.innerWidth < 768 ? 10 : 12,
                        boxWidth: window.innerWidth < 768 ? 15 : 18,
                        boxHeight: window.innerWidth < 768 ? 15 : 18,
                        usePointStyle: false,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const meta = chart.getDatasetMeta(0);
                                    const style = meta.controller.getStyle(i);
                                    let displayLabel = label;
                                    const maxLength = window.innerWidth < 768 ? 13 : 15;
                                    if (label.length > maxLength) {
                                        displayLabel = label.substring(0, maxLength - 2) + '..';
                                    }
                                    return {
                                        text: displayLabel,
                                        fillStyle: style.backgroundColor,
                                        strokeStyle: style.borderColor,
                                        lineWidth: 2,
                                        hidden: !chart.getDataVisibility(i),
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                }
            }
        }
    });
}

// ===== IMPRESIÓN DE TICKET =====
function imprimirTicket() {
    if (state.ventaEnEdicion) {
        const ventaExistente = state.ventasActuales.find(v => v.id === state.ventaEnEdicion);
        if (ventaExistente) {
            imprimirTicketVenta(ventaExistente);
            return;
        }
    }
    
    if (state.productosTemporal.length === 0) {
        alert('⚠️ Agrega al menos un producto antes de imprimir');
        return;
    }
    
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

// ===== 💰 MODIFICACIONES PARA INTEGRAR ANTICIPO =====

// ========================================
// 🎫 MODIFICACIÓN 1: imprimirTicketVenta()
// ========================================
// Reemplaza la función imprimirTicketVenta() existente con esta versión:

function imprimirTicketVenta(venta) {
    const ventanaImpresion = window.open('', '', 'width=800,height=600');
    
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
    
    // 💰 OBTENER ANTICIPO
    const anticipo = parseFloat(venta.anticipo || 0);
    const totalOriginal = venta.total || 0;
    const totalFinal = totalOriginal - anticipo;
    
    // 💰 GENERAR SECCIÓN DE ANTICIPO SI EXISTE
    const seccionAnticipo = anticipo > 0 ? `
        <div class="separador"></div>
        <div class="seccion">
            <div class="fila">
                <span class="label">Subtotal:</span>
                <span>$${totalOriginal.toFixed(2)}</span>
            </div>
            <div class="fila" style="color: #81C784; font-weight: 600;">
                <span class="label">Anticipo:</span>
                <span>-$${anticipo.toFixed(2)}</span>
            </div>
        </div>
    ` : '';
    
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ticket - JaLi Bzar</title>
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
                
                ${seccionAnticipo}
                
                <div class="total">
                    TOTAL${anticipo > 0 ? ' A PAGAR' : ''}: $${totalFinal.toFixed(2)}
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
// ===== GENERAR IMAGEN DESDE MODAL DE VENTAS =====
function generarImagenDesdeVenta() {
    if (state.ventaEnEdicion) {
        const ventaExistente = state.ventasActuales.find(v => v.id === state.ventaEnEdicion);
        if (ventaExistente) {
            generarImagenCuteDesdeVenta(ventaExistente);
            return;
        }
    }
    
    if (state.productosTemporal.length === 0) {
        alert('⚠️ Agrega al menos un producto antes de generar la imagen');
        return;
    }
    
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

// ========================================
// 🖼️ MODIFICACIÓN 2: generarImagenCuteDesdeVenta()
// ========================================
// Reemplaza la función generarImagenCuteDesdeVenta() existente con esta versión:

function generarImagenCuteDesdeVenta(venta) {
    const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const filasProductos = venta.productos.map(prod => `
        <tr>
            <td style="padding: 8px 6px; border: 1px solid #FFD1E8; font-size: 14px;">${prod.nombre}</td>
            <td style="padding: 8px 6px; border: 1px solid #FFD1E8; text-align: center; font-size: 14px;">${prod.cantidad}</td>
            <td style="padding: 8px 6px; border: 1px solid #FFD1E8; text-align: center; font-size: 14px;">$${prod.precioUnitario.toFixed(2)}</td>
            <td style="padding: 8px 6px; border: 1px solid #FFD1E8; text-align: center; font-weight: 600; font-size: 14px;">$${prod.subtotal.toFixed(2)}</td>
        </tr>
    `).join('');
    
    // 💰 OBTENER ANTICIPO
    const anticipo = parseFloat(venta.anticipo || 0);
    const totalOriginal = venta.total || 0;
    const totalFinal = totalOriginal - anticipo;
    
    // 💰 GENERAR SECCIÓN DE ANTICIPO SI EXISTE
    const seccionAnticipo = anticipo > 0 ? `
        <div class="info-box" style="background: linear-gradient(135deg, #F1F8F4, #E8F5E9); border-color: #81C784;">
            <div class="info-row">
                <span class="info-label" style="color: #666;">Subtotal:</span>
                <span class="info-value">$${totalOriginal.toFixed(2)}</span>
            </div>
            <div class="info-row">
                <span class="info-label" style="color: #81C784;">💵 Anticipo:</span>
                <span class="info-value" style="color: #81C784; font-weight: 600;">-$${anticipo.toFixed(2)}</span>
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 2px dashed #81C784; font-size: 14px; color: #666; font-style: italic;">
                💡 El cliente ya pagó $${anticipo.toFixed(2)} de anticipo
            </div>
        </div>
    ` : '';
    
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
                            </tbody>
                        </table>
                    </div>
                    
                    ${seccionAnticipo}
                    
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
                        <span class="total-label">Total${anticipo > 0 ? ' a Pagar' : ''}</span>
                        <span class="total-monto">$${totalFinal.toFixed(2)}</span>
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
function agregarClienteRapidoLive() {
    const nombreCliente = document.getElementById('quickCliente').value.trim();
    
    if (!nombreCliente) {
        alert('⚠️ Escribe el nombre del cliente');
        document.getElementById('quickCliente').focus();
        return;
    }
    
    const existe = state.carritosLive.find(c => 
        c.nombre.toLowerCase() === nombreCliente.toLowerCase()
    );
    
    if (existe) {
        alert('⚠️ Este cliente ya existe');
        document.getElementById('quickCliente').value = '';
        document.getElementById('quickCliente').focus();
        return;
    }
    
    const carrito = {
        id: Date.now(),
        nombre: nombreCliente,
        productos: [],
        total: 0
    };
    
    state.carritosLive.unshift(carrito);
    
    document.getElementById('quickCliente').value = '';
    document.getElementById('quickCliente').focus();
    
    guardarDatos();
    actualizarCarritosGrid();
    sonarExito();
    mostrarNotificacion(`✅ Cliente ${nombreCliente} agregado`, 'success');
}

function actualizarCarritosGrid() {
    const container = document.getElementById('carritosContainer');
    if (!container) {
        console.warn('Container de carritos no encontrado');
        return;
    }
    
    if (!state.carritosLive) {
        state.carritosLive = [];
    }
    
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
    
    state.carritosLive.forEach(carrito => {
        const cantidadProductos = carrito.productos ? carrito.productos.length : 0;
        const total = carrito.total || 0;
        
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

function abrirCarrito(carritoId) {
    const carrito = state.carritosLive.find(c => c.id === carritoId);
    if (!carrito) return;
    
    state.carritoActual = carritoId;
    document.getElementById('nombreClienteCarrito').textContent = carrito.nombre;
    actualizarListaProductosCarrito();
    abrirModal('modalCarrito');
}

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
    
    document.getElementById('carritoProducto').value = '';
    document.getElementById('carritoCantidad').value = '';
    document.getElementById('carritoPrecio').value = '';
    document.getElementById('carritoProducto').focus();
    
    guardarDatos();
    actualizarListaProductosCarrito();
    actualizarCarritosGrid();
    sonarPop();
}

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
    
    const filasProductos = carrito.productos.map(prod => `
        <tr>
            <td style="padding: 8px 6px; border: 1px solid #FFD1E8; font-size: 14px;">${prod.nombre}</td>
            <td style="padding: 8px 6px; border: 1px solid #FFD1E8; text-align: center; font-size: 14px;">${prod.cantidad}</td>
            <td style="padding: 8px 6px; border: 1px solid #FFD1E8; text-align: center; font-size: 14px;">$${prod.precioUnitario.toFixed(2)}</td>
            <td style="padding: 8px 6px; border: 1px solid #FFD1E8; text-align: center; font-weight: 600; font-size: 14px;">$${prod.subtotal.toFixed(2)}</td>
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
            let cliente = state.clientes.find(c => c.nombre.toLowerCase() === carrito.nombre.toLowerCase());
            
            let recolectorVenta = 'Facebook Live';
            let grupoVenta = 'LIVE';
            
            if (cliente && cliente.recolector && cliente.grupo) {
                recolectorVenta = cliente.recolector;
                grupoVenta = cliente.grupo;
            } else if (!cliente) {
                cliente = {
                    id: Date.now() + Math.random(),
                    nombre: carrito.nombre,
                    tipo: 'Foráneo',
                    recolector: 'Facebook Live',
                    grupo: 'LIVE'
                };
                state.clientes.push(cliente);
            }
            
            const ahora = new Date().toISOString();
            const venta = {
                id: Date.now() + Math.random(),
                fechaCreacion: ahora,
                fechaModificacion: ahora,
                fecha: ahora,
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
    
    state.carritosLive = [];
    document.getElementById('quickCliente').value = '';
    
    guardarDatos();
    actualizarCarritosGrid();
    actualizarTablaVentas();
    actualizarListaClientes();
    actualizarDashboard();
    
    sonarExito();
    mostrarNotificacion(`✅ Live finalizado! ${ventasCreadas} ventas creadas`, 'success');
    cambiarSeccion('ventas');
}

function limpiarTodosLosCarritos() {
    if (state.carritosLive.length === 0) {
        alert('⚠️ No hay carritos para limpiar');
        return;
    }
    
    if (!confirm(`¿Eliminar TODOS los ${state.carritosLive.length} carritos?\n\n⚠️ ADVERTENCIA: Esto NO creará ventas, solo borrará los carritos.`)) {
        return;
    }
    
    state.carritosLive = [];
    document.getElementById('quickCliente').value = '';
    
    guardarDatos();
    actualizarCarritosGrid();
    sonarClick();
    mostrarNotificacion('🗑️ Todos los carritos eliminados', 'info');
}

// ===== GENERAR HOJAS DE ENTREGA =====
function generarHojasEntregaPorGrupo() {
    const ventasPagadas = state.ventasActuales.filter(v => v.pago === 'PAGADO');
    
    if (ventasPagadas.length === 0) {
        alert('⚠️ No hay ventas con estado PAGADO para generar hojas');
        return;
    }
    
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
    
    if (grupos.length === 1) {
        generarPDFGrupo(grupos[0], ventasPorGrupo[grupos[0]]);
        sonarExito();
        return;
    }
    
    mostrarSelectorGrupos(grupos, ventasPorGrupo);
}

function mostrarSelectorGrupos(grupos, ventasPorGrupo) {
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
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open');
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
    
    const ventasOrdenadas = [...ventas].sort((a, b) => {
        const recolectorA = (a.recolector || '').toLowerCase();
        const recolectorB = (b.recolector || '').toLowerCase();
        return recolectorA.localeCompare(recolectorB);
    });
    
    let totalPiezas = 0;
    let totalPaquetes = 0;
    
    const filasHTML = ventasOrdenadas.map(venta => {
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

// ===== PERSISTENCIA DE DATOS =====
let timeoutGuardar = null;

function guardarDatos() {
    localStorage.setItem('jali_bzar_data', JSON.stringify(state));
    
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
    const datosLocales = localStorage.getItem('jali_bzar_data');
    if (datosLocales) {
        const datosParseados = JSON.parse(datosLocales);
        Object.assign(state, datosParseados);
        
        if (!state.carritosLive) {
            state.carritosLive = [];
        }
        
        console.log('✅ Datos cargados desde localStorage');
    }
    
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized) {
        cargarTodoDesdeFirebase();
    }
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje, tipo = 'info') {
    // 🚫 BLOQUEAR MENSAJES DE SINCRONIZACIÓN
    const mensajeLower = mensaje.toLowerCase();
    if (mensajeLower.includes('sincronizado') ||
        mensajeLower.includes('guardado') ||
        mensajeLower.includes('firebase') ||
        mensajeLower.includes('sync') ||
        mensajeLower.includes('nube')) {
        return; // No mostrar la notificación
    }
    
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

// ===== FUNCIONES DASHBOARD CLICABLES =====
function verVentasDelDia() {
    const hoy = new Date().toDateString();
    const ventasHoy = state.ventasActuales.filter(v => {
        const fechaVenta = v.fechaCreacion || v.fecha;
        return new Date(fechaVenta).toDateString() === hoy;
    });
    
    cambiarSeccion('ventas');
    actualizarTablaVentas(ventasHoy);
    mostrarNotificacion(`Mostrando ${ventasHoy.length} venta(s) de hoy 📅`, 'info');
}

function verVentasDeLaSemana() {
    const ahora = new Date();
    const inicioSemana = new Date(ahora);
    inicioSemana.setDate(ahora.getDate() - ahora.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    const ventasSemana = state.ventasActuales.filter(v => {
        const fechaVenta = new Date(v.fechaCreacion || v.fecha);
        return fechaVenta >= inicioSemana;
    });
    
    cambiarSeccion('ventas');
    actualizarTablaVentas(ventasSemana);
    mostrarNotificacion(`Mostrando ${ventasSemana.length} venta(s) de esta semana 📊`, 'info');
}

function verPedidosPendientes() {
    const ventasPendientes = state.ventasActuales.filter(v => v.pago === 'PENDIENTE');
    cambiarSeccion('ventas');
    actualizarTablaVentas(ventasPendientes);
    mostrarNotificacion(`Mostrando ${ventasPendientes.length} pedido(s) pendiente(s) ⏳`, 'info');
}

function verPedidosPagados() {
    const ventasPagadas = state.ventasActuales.filter(v => v.pago === 'PAGADO');
    cambiarSeccion('ventas');
    actualizarTablaVentas(ventasPagadas);
    mostrarNotificacion(`Mostrando ${ventasPagadas.length} pedido(s) pagado(s) ✅`, 'info');
}

function verTodosLosClientes() {
    cambiarSeccion('clientes');
    actualizarListaClientes();
    mostrarNotificacion(`Mostrando ${state.clientes.length} cliente(s) 👥`, 'info');
}

// ===== CALCULADORA KAWAII =====
const calcState = {
    currentValue: '0',
    previousValue: '',
    operator: null,
    shouldResetDisplay: false,
    history: []
};

function calcNumber(num) {
    sonarClick();
    
    if (calcState.shouldResetDisplay) {
        calcState.currentValue = num;
        calcState.shouldResetDisplay = false;
    } else {
        if (calcState.currentValue === '0' && num !== '.') {
            calcState.currentValue = num;
        } else if (num === '.' && calcState.currentValue.includes('.')) {
            return;
        } else {
            calcState.currentValue += num;
        }
    }
    
    updateCalcDisplay();
}

function calcOperator(op) {
    sonarClick();
    
    if (calcState.operator && !calcState.shouldResetDisplay) {
        calcEquals();
    }
    
    calcState.previousValue = calcState.currentValue;
    calcState.operator = op;
    calcState.shouldResetDisplay = true;
    
    updateCalcDisplay();
}

function calcEquals() {
    sonarExito();
    
    if (!calcState.operator || calcState.shouldResetDisplay) return;
    
    const prev = parseFloat(calcState.previousValue);
    const current = parseFloat(calcState.currentValue);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    let result = 0;
    const operation = `${prev} ${calcState.operator} ${current}`;
    
    switch (calcState.operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            if (current === 0) {
                alert('🙊 ¡No se puede dividir entre cero, mana!');
                calcClear();
                return;
            }
            result = prev / current;
            break;
    }
    
    result = Math.round(result * 100) / 100;
    addToCalcHistory(operation, result);
    
    calcState.currentValue = result.toString();
    calcState.operator = null;
    calcState.previousValue = '';
    calcState.shouldResetDisplay = true;
    
    updateCalcDisplay();
}

function calcPercent() {
    sonarClick();
    const current = parseFloat(calcState.currentValue);
    if (isNaN(current)) return;
    calcState.currentValue = (current / 100).toString();
    updateCalcDisplay();
}

function calcClear() {
    sonarClick();
    calcState.currentValue = '0';
    calcState.previousValue = '';
    calcState.operator = null;
    calcState.shouldResetDisplay = false;
    updateCalcDisplay();
}

function calcDelete() {
    sonarClick();
    if (calcState.currentValue.length > 1) {
        calcState.currentValue = calcState.currentValue.slice(0, -1);
    } else {
        calcState.currentValue = '0';
    }
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const resultElement = document.getElementById('calcResult');
    const operationElement = document.getElementById('calcOperation');
    
    if (!resultElement || !operationElement) return;
    
    resultElement.textContent = calcState.currentValue;
    
    if (calcState.operator && calcState.previousValue) {
        operationElement.textContent = `${calcState.previousValue} ${calcState.operator}`;
    } else {
        operationElement.textContent = '';
    }
}

function addToCalcHistory(operation, result) {
    calcState.history.unshift({
        operation: operation,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    });
    
    if (calcState.history.length > 10) {
        calcState.history = calcState.history.slice(0, 10);
    }
    
    localStorage.setItem('calcHistory', JSON.stringify(calcState.history));
    updateCalcHistory();
}

function updateCalcHistory() {
    const historyElement = document.getElementById('calcHistory');
    if (!historyElement) return;
    
    if (calcState.history.length === 0) {
        historyElement.innerHTML = `
            <p style="color: #999; text-align: center; padding: 20px;">
                No hay cálculos aún
            </p>
        `;
        return;
    }
    
    historyElement.innerHTML = calcState.history.map(item => `
        <div class="calc-history-item">
            <div class="calc-history-operation">${item.operation}</div>
            <div class="calc-history-result">= ${item.result}</div>
        </div>
    `).join('');
}

function calcClearHistory() {
    if (confirm('¿Borrar todo el historial de cálculos?')) {
        calcState.history = [];
        localStorage.removeItem('calcHistory');
        updateCalcHistory();
        mostrarNotificacion('Historial limpiado ✨', 'info');
    }
}

function loadCalcHistory() {
    const saved = localStorage.getItem('calcHistory');
    if (saved) {
        try {
            calcState.history = JSON.parse(saved);
            updateCalcHistory();
        } catch (e) {
            console.error('Error cargando historial de calculadora:', e);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loadCalcHistory();
    }, 500);
});

document.addEventListener('keydown', (e) => {
    const calcSection = document.getElementById('calculadora');
    if (!calcSection || !calcSection.classList.contains('active')) return;
    
    if (e.key >= '0' && e.key <= '9') {
        calcNumber(e.key);
    } else if (e.key === '.') {
        calcNumber('.');
    } else if (e.key === '+') {
        calcOperator('+');
    } else if (e.key === '-') {
        calcOperator('-');
    } else if (e.key === '*') {
        calcOperator('×');
    } else if (e.key === '/') {
        e.preventDefault();
        calcOperator('÷');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calcEquals();
    } else if (e.key === 'Escape') {
        calcClear();
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        calcDelete();
    } else if (e.key === '%') {
        calcPercent();
    }
});

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

// ===== MENÚ HAMBURGUESA (MÓVIL) =====
(function() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const btnCerrarMenu = document.getElementById('btnCerrarMenu');
    const mobileNavBtns = document.querySelectorAll('.mobile-nav .nav-btn');
    
    if (!hamburgerBtn || !mobileMenu || !mobileOverlay) return;
    
    function cerrarMenu() {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function abrirMenu() {
        hamburgerBtn.classList.add('active');
        mobileMenu.classList.add('active');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Abrir/cerrar menú con hamburguesa
    hamburgerBtn.addEventListener('click', function() {
        const isActive = mobileMenu.classList.contains('active');
        if (isActive) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });
    
    // Cerrar menú con botón X dentro del menú
    if (btnCerrarMenu) {
        btnCerrarMenu.addEventListener('click', function() {
            cerrarMenu();
        });
    }
    
    // Cerrar menú al hacer click en overlay
    mobileOverlay.addEventListener('click', function() {
        cerrarMenu();
    });
    
    // Cerrar menú al seleccionar una opción
    mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Cerrar menú
            setTimeout(() => {
                cerrarMenu();
            }, 200);
            
            // Actualizar botón activo en menú móvil
            mobileNavBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Sincronizar botones activos entre desktop y móvil
    const desktopNavBtns = document.querySelectorAll('.main-nav .nav-btn');
    desktopNavBtns.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            // Actualizar también en menú móvil
            mobileNavBtns.forEach(b => b.classList.remove('active'));
            if (mobileNavBtns[index]) {
                mobileNavBtns[index].classList.add('active');
            }
        });
    });
})();

// ===== ARREGLO BOTONES DE INICIO MÓVIL =====
function irAInicio() {
    // Mostrar el header siempre
    const headerPrincipal = document.getElementById('headerPrincipal');
    if (headerPrincipal) {
        headerPrincipal.style.display = 'block';
    }
    
    // Cambiar a dashboard
    cambiarSeccion('dashboard');
    
    // Quitar fullscreen de cualquier sección
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('mobile-fullscreen');
    });
}

// ========================================
// 🔒 MODIFICACIÓN 3: Nueva función de limpieza ultra segura
// ========================================
// AGREGA esta nueva función (NO reemplaces nada, solo agrégala):

function limpiarFormularioVentaCompleto() {
    console.log('🧹🧹🧹 LIMPIEZA COMPLETA DE FORMULARIO...');
    
    // 1. Resetear formulario HTML
    const form = document.getElementById('formVenta');
    if (form) {
        form.reset();
    }
    
    // 2. Limpiar campos específicos
    document.getElementById('ventaCliente').value = '';
    document.getElementById('ventaRecolector').value = '';
    document.getElementById('ventaGrupo').value = '';
    document.getElementById('ventaPaquetes').value = '';
    document.getElementById('ventaPago').value = '';
    
    // 3. Limpiar productos en campos individuales
    document.getElementById('nombreProducto').value = '';
    document.getElementById('cantidadProducto').value = '1';
    document.getElementById('precioProducto').value = '';
    
    // 4. 💰 Limpiar anticipo
    const anticipoInput = document.getElementById('anticipo');
    if (anticipoInput) {
        anticipoInput.value = '0';
    }
    
    // 5. Limpiar estado temporal - LA PARTE MÁS IMPORTANTE
    state.productosTemporal = [];
    state.ventaEnEdicion = null;
    
    // 6. Limpiar visualmente la lista
    const container = document.getElementById('listaProductos');
    if (container) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;" id="msgSinProductos">No hay productos agregados</p>';
    }
    
    // 7. Resetear total
    const totalElement = document.getElementById('totalVentaModal');
    if (totalElement) {
        totalElement.textContent = '$0.00';
    }
    
    // 8. Título
    document.getElementById('tituloModalVenta').textContent = 'Nueva Venta 🛍️';
    
    console.log('✅ Limpieza completa finalizada:', {
        productosTemp: state.productosTemporal.length,
        ventaEnEdicion: state.ventaEnEdicion,
        anticipo: anticipoInput ? anticipoInput.value : '0'
    });
}

// Detectar cuando se abre el modal y logear el estado
document.addEventListener('DOMContentLoaded', function() {
    const modalVenta = document.getElementById('modalVenta');
    if (modalVenta) {
        // Observar cuando se abre el modal
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const isActive = modalVenta.classList.contains('active');
                    if (isActive) {
                        console.log('👁️ Modal de venta abierto');
                        console.log('Estado actual:', {
                            productosTemp: state.productosTemporal.length,
                            ventaEnEdicion: state.ventaEnEdicion,
                            productos: state.productosTemporal
                        });
                        
                        // 🛡️ VALIDACIÓN EXTRA: Si hay productos y NO estamos editando, limpiar
                        if (state.productosTemporal.length > 0 && !state.ventaEnEdicion) {
                            console.warn('⚠️ ADVERTENCIA: Hay productos pero no estamos editando. Limpiando...');
                            limpiarFormularioVentaCompleto();
                        }
                    }
                }
            });
        });
        
        observer.observe(modalVenta, { attributes: true });
    }
});

console.log('✅ Parche de seguridad cargado exitosamente');

// ========================================
// 📲 PWA - INSTALACIÓN DE LA APP
// ========================================
let deferredPrompt;
const btnInstalarApp = document.getElementById('btnInstalarApp');

// Detectar cuando la app se puede instalar
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📲 App lista para instalar');
    
    // Prevenir que Chrome muestre su propio prompt automáticamente
    e.preventDefault();
    
    // Guardar el evento para usarlo después
    deferredPrompt = e;
    
    // Mostrar nuestro botón personalizado
    if (btnInstalarApp) {
        btnInstalarApp.style.display = 'block';
    }
});

// Cuando hacen click en el botón
if (btnInstalarApp) {
    btnInstalarApp.addEventListener('click', async () => {
        if (!deferredPrompt) {
            console.log('⚠️ No hay prompt disponible');
            return;
        }
        
        // Mostrar el prompt de instalación
        deferredPrompt.prompt();
        
        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`Usuario respondió: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('✅ Usuario aceptó instalar la app');
            
            // Animación de éxito
            btnInstalarApp.textContent = '✅ Instalando...';
            btnInstalarApp.style.background = 'linear-gradient(135deg, #81C784, #66BB6A)';
            
            setTimeout(() => {
                btnInstalarApp.style.display = 'none';
            }, 2000);
        } else {
            console.log('❌ Usuario rechazó instalar la app');
        }
        
        // Limpiar el prompt
        deferredPrompt = null;
    });
}

// Detectar cuando la app ya está instalada
window.addEventListener('appinstalled', () => {
    console.log('✅ ¡App instalada exitosamente!');
    if (btnInstalarApp) {
        btnInstalarApp.style.display = 'none';
    }
    deferredPrompt = null;
    
    // Opcional: Mostrar notificación de éxito
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion('¡App instalada exitosamente! 🎉', 'success');
    }
});

// Verificar si la app ya está instalada al cargar
window.addEventListener('load', () => {
    // Si ya está instalada como PWA, ocultar el botón
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ App ya está instalada');
        if (btnInstalarApp) {
            btnInstalarApp.style.display = 'none';
        }
    }
});














