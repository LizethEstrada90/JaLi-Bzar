// ===== 💰 ANTICIPO - VERSIÓN CORREGIDA =====

console.log('🎯 Iniciando script de anticipo CORREGIDO...');

window.addEventListener('load', function() {
    console.log('✅ Página cargada, agregando campo de anticipo...');
    
    setTimeout(agregarCampoAnticipo, 500);
    setTimeout(agregarCampoAnticipo, 1500);
    setTimeout(agregarCampoAnticipo, 3000);
    
    document.addEventListener('click', function() {
        setTimeout(agregarCampoAnticipo, 300);
    });
});

function agregarCampoAnticipo() {
    console.log('🔍 Buscando "Estado de Pago" en la página...');
    
    // Verificar si ya existe el campo de anticipo
    if (document.getElementById('campoAnticipo')) {
        console.log('⚠️ Campo de anticipo ya existe');
        return;
    }
    
    // Buscar TODOS los elementos que contengan el texto "Estado de Pago"
    const todosLosElementos = document.querySelectorAll('*');
    let elementoEstadoPago = null;
    
    for (let elemento of todosLosElementos) {
        // Buscar solo en el texto directo del elemento, no en sus hijos
        const textoDirecto = Array.from(elemento.childNodes)
            .filter(node => node.nodeType === 3) // Solo nodos de texto
            .map(node => node.textContent.trim())
            .join('');
        
        if (textoDirecto.includes('Estado de Pago')) {
            elementoEstadoPago = elemento;
            console.log('✅ ¡Encontré "Estado de Pago"!');
            break;
        }
    }
    
    if (!elementoEstadoPago) {
        console.log('❌ No encontré "Estado de Pago"');
        return;
    }
    
    // Buscar el SELECT que viene después
    let selectEstadoPago = elementoEstadoPago.nextElementSibling;
    
    // Si el siguiente elemento no es un select, buscar dentro de él
    if (!selectEstadoPago || selectEstadoPago.tagName !== 'SELECT') {
        selectEstadoPago = elementoEstadoPago.parentElement.querySelector('select');
    }
    
    if (!selectEstadoPago) {
        console.log('❌ No encontré el SELECT de Estado de Pago');
        return;
    }
    
    console.log('✅ ¡SELECT de Estado de Pago encontrado!');
    
    // Crear el div del anticipo
    const anticipoDiv = document.createElement('div');
    anticipoDiv.id = 'campoAnticipo';
    anticipoDiv.style.cssText = 'margin-top: 20px; margin-bottom: 20px;';
    anticipoDiv.innerHTML = `
        <label style="color: #81C784; font-weight: 600; margin-bottom: 8px; display: block; font-size: 0.95rem;">
            💵 Anticipo
        </label>
        <input 
            type="number" 
            id="anticipo" 
            placeholder="0.00" 
            min="0" 
            step="0.01" 
            value="0"
            style="width: 100%; padding: 14px 16px; border: 2px solid rgba(129, 199, 132, 0.4); border-radius: 15px; font-size: 1rem; background: #F1F8F4; color: #2E7D32; font-weight: 600;"
        />
        <div style="font-size: 0.85rem; color: #81C784; margin-top: 5px; font-style: italic;">
            💡 Cantidad que el cliente ya pagó por adelantado
        </div>
    `;
    
    // Insertar después del contenedor del Estado de Pago
    const contenedorEstadoPago = selectEstadoPago.parentElement;
    if (contenedorEstadoPago && contenedorEstadoPago.nextSibling) {
        contenedorEstadoPago.parentNode.insertBefore(anticipoDiv, contenedorEstadoPago.nextSibling);
        console.log('✅ ¡Campo de anticipo agregado exitosamente!');
        
        // Agregar evento para actualizar el total
        const anticipoInput = document.getElementById('anticipo');
        if (anticipoInput) {
            anticipoInput.addEventListener('input', actualizarTotal);
            console.log('✅ Evento de actualización agregado');
        }
    } else {
        console.log('❌ No pude insertar el campo');
    }
}

function actualizarTotal() {
    const anticipoInput = document.getElementById('anticipo');
    if (!anticipoInput) return;
    
    const anticipo = parseFloat(anticipoInput.value) || 0;
    console.log(`💰 Anticipo ingresado: $${anticipo}`);
    
    // NO modificar el DOM por ahora, solo guardar el valor
    // Guardar el anticipo en una variable global
    window.anticipoActual = anticipo;
    
    console.log(`✅ Anticipo guardado: $${anticipo}`);
}

console.log('✅ Script de anticipo CORREGIDO cargado');