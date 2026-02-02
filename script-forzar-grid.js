// ===== 🚀 SCRIPT NUCLEAR PARA FORZAR GRID HORIZONTAL =====

(function() {
    console.log('🎯 Iniciando script para forzar grid horizontal V2...');
    
    function forzarGridHorizontal() {
        // Detectar tamaño de pantalla
        const ancho = window.innerWidth;
        let columnas;
        
        if (ancho > 1400) {
            columnas = '4'; // 4 columnas en pantallas grandes
        } else if (ancho > 1024) {
            columnas = '3'; // 3 columnas en pantallas medianas
        } else if (ancho > 768) {
            columnas = '2'; // 2 columnas en tablets
        } else {
            columnas = '1'; // 1 columna en móviles
        }
        
        // Buscar los contenedores
        const listaClientes = document.getElementById('listaClientes');
        const listaRecolectores = document.getElementById('listaRecolectores');
        
        // Aplicar estilos directamente con JavaScript
        if (listaClientes) {
            listaClientes.style.cssText = `
                display: grid !important;
                grid-template-columns: repeat(${columnas}, 1fr) !important;
                gap: 25px !important;
                padding: 20px 0 !important;
                width: 100% !important;
            `;
            console.log(`✅ Grid aplicado a listaClientes (${columnas} columnas)`);
        }
        
        if (listaRecolectores) {
            listaRecolectores.style.cssText = `
                display: grid !important;
                grid-template-columns: repeat(${columnas}, 1fr) !important;
                gap: 25px !important;
                padding: 20px 0 !important;
                width: 100% !important;
            `;
            console.log(`✅ Grid aplicado a listaRecolectores (${columnas} columnas)`);
        }
        
        // Buscar todos los .cards-grid también
        document.querySelectorAll('.cards-grid').forEach(grid => {
            grid.style.cssText = `
                display: grid !important;
                grid-template-columns: repeat(${columnas}, 1fr) !important;
                gap: 25px !important;
                padding: 20px 0 !important;
                width: 100% !important;
            `;
            console.log(`✅ Grid aplicado a .cards-grid (${columnas} columnas)`);
        });
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forzarGridHorizontal);
    } else {
        forzarGridHorizontal();
    }
    
    // Volver a ejecutar cuando se redimensione la ventana
    window.addEventListener('resize', forzarGridHorizontal);
    
    // Volver a ejecutar cada vez que se actualicen los clientes/recolectores
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'listaClientes' || mutation.target.id === 'listaRecolectores') {
                forzarGridHorizontal();
            }
        });
    });
    
    // Observar cambios en el body
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Observer de grid activado V2');
})();