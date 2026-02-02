// ===== 🔥 SCRIPT PARA FORZAR LAYOUT HORIZONTAL DEL INPUT ===== 

(function() {
    console.log('🎯 Iniciando script para arreglar layout del input...');
    
    function arreglarLayoutInput() {
        // Buscar el input de nombre
        const inputNombre = document.getElementById('nombreCliente') || 
                          document.querySelector('input[placeholder*="Nombre del Cliente"]') ||
                          document.querySelector('input[placeholder*="Nombre"]');
        
        if (inputNombre) {
            console.log('✅ Input encontrado:', inputNombre);
            
            // Buscar el botón que está después del input
            const boton = inputNombre.nextElementSibling;
            
            if (boton && boton.tagName === 'BUTTON') {
                console.log('✅ Botón encontrado:', boton);
                
                // Buscar el contenedor padre
                const contenedor = inputNombre.parentElement;
                
                if (contenedor) {
                    // Aplicar flex al contenedor
                    contenedor.style.cssText = `
                        display: flex !important;
                        flex-direction: row !important;
                        gap: 15px !important;
                        align-items: stretch !important;
                        width: 100% !important;
                    `;
                    
                    // Aplicar estilos al input
                    inputNombre.style.cssText = `
                        flex: 1 !important;
                        min-width: 0 !important;
                        padding: 18px 20px 18px 45px !important;
                        font-size: 1.1rem !important;
                        border: 3px solid rgba(139, 127, 217, 0.3) !important;
                        border-radius: 20px !important;
                        background: white !important;
                        color: #333 !important;
                        transition: all 0.3s ease !important;
                        box-shadow: 0 4px 15px rgba(139, 127, 217, 0.1) !important;
                        margin: 0 !important;
                    `;
                    
                    // Aplicar estilos al botón
                    boton.style.cssText = `
                        flex-shrink: 0 !important;
                        background: linear-gradient(135deg, #81C784, #66BB6A) !important;
                        color: white !important;
                        border: none !important;
                        padding: 18px 25px !important;
                        border-radius: 20px !important;
                        font-size: 1.5rem !important;
                        font-weight: bold !important;
                        cursor: pointer !important;
                        transition: all 0.3s ease !important;
                        box-shadow: 0 6px 20px rgba(129, 199, 132, 0.3) !important;
                        min-width: 60px !important;
                        height: auto !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        margin: 0 !important;
                    `;
                    
                    console.log('✅ Layout horizontal aplicado');
                }
            }
        }
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', arreglarLayoutInput);
    } else {
        arreglarLayoutInput();
    }
    
    // Volver a ejecutar con un observer
    const observer = new MutationObserver(arreglarLayoutInput);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Ejecutar varias veces por si acaso
    setTimeout(arreglarLayoutInput, 500);
    setTimeout(arreglarLayoutInput, 1000);
    setTimeout(arreglarLayoutInput, 2000);
    
    console.log('✅ Script de layout inicializado');
})();