// ===== CONFIGURACIÓN DE FIREBASE =====

/*
✅ CONFIGURACIÓN COMPLETADA
Tu proyecto Firebase ya está configurado y listo para usar.

ÚLTIMO PASO: Configurar Reglas de Seguridad
1. Ve a Firebase Console → Realtime Database → Reglas
2. Pega esto:
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
3. Click "Publicar"
4. ¡Listo!
*/

const firebaseConfig = {
    apiKey: "AIzaSyBax_JDOjTpLU0kiZuGRM9m85qRjJ3XQO8",
    authDomain: "jali-bzar.firebaseapp.com",
    databaseURL: "https://jali-bzar-default-rtdb.firebaseio.com",
    projectId: "jali-bzar",
    storageBucket: "jali-bzar.firebasestorage.app",
    messagingSenderId: "486516675092",
    appId: "1:486516675092:web:495a92e83d5da33f840d01"
};

// Inicializar Firebase
let database = null;
let firebaseInitialized = false;

function initFirebase() {
    actualizarIndicadorFirebase('sincronizando');
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        firebaseInitialized = true;
        console.log('✅ Firebase inicializado correctamente');
        actualizarIndicadorFirebase('conectado');
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error);
        firebaseInitialized = false;
        actualizarIndicadorFirebase('error');
        return false;
    }
}

// ===== FUNCIONES DE BASE DE DATOS =====

// Guardar datos en Firebase
function guardarEnFirebase(ruta, datos) {
    if (!firebaseInitialized) {
        console.warn('⚠️ Firebase no está configurado. Usando localStorage.');
        return Promise.resolve();
    }
    
    return database.ref(ruta).set(datos)
        .then(() => {
            console.log(`✅ Datos guardados en Firebase: ${ruta}`);
        })
        .catch((error) => {
            console.error('❌ Error al guardar en Firebase:', error);
            throw error;
        });
}

// Cargar datos de Firebase
function cargarDeFirebase(ruta) {
    if (!firebaseInitialized) {
        console.warn('⚠️ Firebase no está configurado. Usando localStorage.');
        return Promise.resolve(null);
    }
    
    return database.ref(ruta).once('value')
        .then((snapshot) => {
            const datos = snapshot.val();
            console.log(`✅ Datos cargados de Firebase: ${ruta}`);
            return datos;
        })
        .catch((error) => {
            console.error('❌ Error al cargar de Firebase:', error);
            throw error;
        });
}

// Escuchar cambios en tiempo real
function escucharCambios(ruta, callback) {
    if (!firebaseInitialized) {
        console.warn('⚠️ Firebase no está configurado.');
        return;
    }
    
    database.ref(ruta).on('value', (snapshot) => {
        const datos = snapshot.val();
        callback(datos);
    });
}

// Eliminar datos de Firebase
function eliminarDeFirebase(ruta) {
    if (!firebaseInitialized) {
        console.warn('⚠️ Firebase no está configurado. Usando localStorage.');
        return Promise.resolve();
    }
    
    return database.ref(ruta).remove()
        .then(() => {
            console.log(`✅ Datos eliminados de Firebase: ${ruta}`);
        })
        .catch((error) => {
            console.error('❌ Error al eliminar de Firebase:', error);
            throw error;
        });
}

// ===== SINCRONIZACIÓN COMPLETA =====

// Guardar todo el estado en Firebase
async function sincronizarTodo() {
    if (!firebaseInitialized) {
        console.warn('⚠️ Firebase no está configurado. Los datos solo se guardan localmente.');
        return;
    }
    
    try {
        await Promise.all([
            guardarEnFirebase('clientes', state.clientes),
            guardarEnFirebase('recolectores', state.recolectores),
            guardarEnFirebase('ventasActuales', state.ventasActuales),
            guardarEnFirebase('historialSemanas', state.historialSemanas),
            guardarEnFirebase('semanaActual', state.semanaActual)
        ]);
        
        console.log('✅ Todos los datos sincronizados con Firebase');
        mostrarNotificacion('☁️ Datos sincronizados en la nube', 'success');
    } catch (error) {
        console.error('❌ Error al sincronizar:', error);
        mostrarNotificacion('⚠️ Error al sincronizar con la nube', 'error');
    }
}

// Cargar todo desde Firebase
async function cargarTodoDesdeFirebase() {
    if (!firebaseInitialized) {
        console.warn('⚠️ Firebase no está configurado. Cargando desde localStorage.');
        return false;
    }
    
    try {
        const [clientes, recolectores, ventasActuales, historialSemanas, semanaActual] = await Promise.all([
            cargarDeFirebase('clientes'),
            cargarDeFirebase('recolectores'),
            cargarDeFirebase('ventasActuales'),
            cargarDeFirebase('historialSemanas'),
            cargarDeFirebase('semanaActual')
        ]);
        
        // Actualizar estado si hay datos
        if (clientes) state.clientes = clientes;
        if (recolectores) state.recolectores = recolectores;
        if (ventasActuales) state.ventasActuales = ventasActuales;
        if (historialSemanas) state.historialSemanas = historialSemanas;
        if (semanaActual) state.semanaActual = semanaActual;
        
        console.log('✅ Todos los datos cargados desde Firebase');
        mostrarNotificacion('☁️ Datos cargados desde la nube', 'success');
        return true;
    } catch (error) {
        console.error('❌ Error al cargar desde Firebase:', error);
        mostrarNotificacion('⚠️ Error al cargar desde la nube', 'error');
        return false;
    }
}

// Verificar si Firebase está configurado
function verificarConfiguracionFirebase() {
    const configurado = firebaseConfig.apiKey !== "TU_API_KEY_AQUI" && 
                        firebaseConfig.databaseURL && 
                        firebaseConfig.databaseURL !== "https://tu-proyecto-default-rtdb.firebaseio.com";
    
    if (!configurado) {
        console.warn('⚠️ Firebase no está completamente configurado.');
        console.warn('📖 Necesitas habilitar Realtime Database y agregar la URL en firebase-config.js');
        actualizarIndicadorFirebase('no-configurado');
    }
    
    return configurado;
}

// Actualizar indicador visual de Firebase
function actualizarIndicadorFirebase(estado) {
    const indicador = document.getElementById('firebaseStatus');
    const icono = document.getElementById('firebaseIcon');
    const texto = document.getElementById('firebaseText');
    
    if (!indicador || !icono || !texto) return;
    
    indicador.style.display = 'flex';
    
    switch(estado) {
        case 'conectado':
            indicador.style.background = 'linear-gradient(135deg, #C8E6C9, #A5D6A7)';
            indicador.style.color = '#2E7D32';
            icono.textContent = '☁️';
            texto.textContent = 'Sincronizado';
            indicador.title = 'Datos sincronizados en la nube ✓';
            break;
            
        case 'sincronizando':
            indicador.style.background = 'linear-gradient(135deg, #FFF9C4, #FFF59D)';
            indicador.style.color = '#F57F17';
            icono.textContent = '🔄';
            texto.textContent = 'Sincronizando...';
            indicador.title = 'Sincronizando datos con Firebase...';
            break;
            
        case 'error':
            indicador.style.background = 'linear-gradient(135deg, #FFCDD2, #EF9A9A)';
            indicador.style.color = '#C62828';
            icono.textContent = '❌';
            texto.textContent = 'Error de conexión';
            indicador.title = 'Error al conectar con Firebase. Revisa la consola.';
            break;
            
        case 'no-configurado':
            indicador.style.background = 'linear-gradient(135deg, #E0E0E0, #BDBDBD)';
            indicador.style.color = '#616161';
            icono.textContent = '⚠️';
            texto.textContent = 'Configurar reglas';
            indicador.title = 'Necesitas configurar reglas de seguridad en Firebase Console';
            break;
            
        case 'offline':
            indicador.style.background = 'linear-gradient(135deg, #FFECB3, #FFE082)';
            indicador.style.color = '#FF6F00';
            icono.textContent = '📴';
            texto.textContent = 'Sin conexión';
            indicador.title = 'Sin conexión a internet. Los datos se sincronizarán cuando vuelva la conexión.';
            break;
    }
    
    // Click para mostrar información
    indicador.onclick = () => {
        if (estado === 'no-configurado') {
            alert('⚠️ Reglas de seguridad no configuradas\n\n📖 Pasos finales:\n\n1. Ve a https://console.firebase.google.com/\n2. Selecciona tu proyecto "jali-bzar"\n3. Realtime Database → Reglas\n4. Pega:\n{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}\n5. Click "Publicar"\n\nMientras tanto, tus datos se guardan solo en este dispositivo.');
        } else if (estado === 'error') {
            alert('❌ Error de conexión con Firebase\n\n🔧 Posibles soluciones:\n\n1. Verifica tu conexión a internet\n2. Revisa que habilitaste Realtime Database\n3. Verifica que la databaseURL sea correcta\n4. Abre la consola (F12) para ver el error específico');
        } else if (estado === 'conectado') {
            alert('☁️ ¡Todo bien!\n\nTus datos están sincronizados en Firebase.\nPuedes acceder desde cualquier dispositivo.');
        }
    };
}
