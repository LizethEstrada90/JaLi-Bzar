// ===== 🚫 OCULTAR BOTÓN CERRAR DE ABAJO =====

(function() {
    console.log('🎯 Iniciando script para ocultar botón Cerrar de abajo...');
    
    function ocultarBotonCerrarAbajo() {
        // Buscar todos los botones
        const botones = document.querySelectorAll('button');
        
        botones.forEach(boton => {
            const texto = boton.textContent.trim();
            
            // Si el botón dice "Cerrar" (ignorando mayúsculas/minúsculas)
            if (texto.toLowerCase() === 'cerrar' || 
                texto.toLowerCase().includes('✕ cerrar') ||
                texto.toLowerCase().includes('× cerrar')) {
                
                // Verificar que NO sea el botón X de arriba (que es pequeño)
                const esBotonX = boton.classList.contains('btn-close') || 
                                boton.getAttribute('aria-label') === 'Cerrar';
                
                // Si NO es el botón X de arriba, ocultarlo
                if (!esBotonX) {
                    boton.style.display = 'none';
                    console.log('✅ Botón "Cerrar" de abajo ocultado');
                }
            }
        });
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ocultarBotonCerrarAbajo);
    } else {
        ocultarBotonCerrarAbajo();
    }
    
    // Volver a ejecutar con un observer
    const observer = new MutationObserver(ocultarBotonCerrarAbajo);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Ejecutar varias veces por si acaso
    setTimeout(ocultarBotonCerrarAbajo, 500);
    setTimeout(ocultarBotonCerrarAbajo, 1000);
    setTimeout(ocultarBotonCerrarAbajo, 2000);
    
    console.log('✅ Script para ocultar botón Cerrar inicializado');
})();