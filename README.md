# 🎀 SISTEMA JALI BZAR - KAWAII POINT OF SALE

Sistema de punto de venta profesional con diseño kawaii estilo Sanrio para el bazar JaLi Bzar, presentando a Bolsi como mascota oficial.

---

## ✨ CARACTERÍSTICAS PRINCIPALES

### 🛍️ Gestión de Ventas
- Registro completo de ventas con todos los campos necesarios
- Tabla interactiva estilo Google Sheets
- Cálculo automático de totales
- Estados de pago con colores (Pendiente, Pagado, No Realizó)
- Impresión directa de tickets térmicos (58mm/80mm)

### 👥 Gestión de Clientes
- Registro de clientes con nombre, grupo y tipo (Local/Foráneo)
- Tarjetas visuales para fácil gestión
- Eliminación de clientes

### 🚚 Gestión de Recolectores
- Registro de recolectores con nombre y grupo
- Sistema de asignación automática de grupos
- Visualización clara de todos los recolectores

### 📊 Dashboard Inteligente
- Estadísticas en tiempo real:
  - Ventas del día
  - Ventas de la semana
  - Total de clientes
  - Pedidos pendientes
  - Pedidos pagados
- Gráficas interactivas (Chart.js):
  - Ventas por día (línea)
  - Top 5 clientes (barras)
  - Ventas por recolector (donut)
  - Productos más vendidos (barras horizontales)

### 📚 Historial de Semanas
- Creación de nuevas semanas
- Archivo automático de semanas anteriores
- Consulta de semanas pasadas
- Descarga de datos en formato CSV
- Preservación de todos los datos históricos

### 🎨 Diseño Kawaii Profesional
- Paleta de colores pastel (rosa, lila, celeste, crema)
- Mascota Bolsi (bolsa kawaii) integrada en el diseño
- Animaciones suaves y micro-interacciones
- Botones con efecto "pop"
- Bordes redondeados (16-24px)
- Sombras suaves profesionales

### 📱 Totalmente Responsive
- Diseño adaptable a celular, tablet y PC
- Navegación optimizada para móviles
- Tablas con scroll horizontal en pantallas pequeñas
- Modales adaptados a pantalla completa en móviles
- Botones táctiles optimizados

---

## 📦 ARCHIVOS INCLUIDOS

```
JaLi_Bzar_Sistema/
│
├── index.html          # Estructura HTML completa
├── styles.css          # Estilos kawaii responsive
├── app.js             # Funcionalidad JavaScript completa
└── README.md          # Este archivo (instrucciones)
```

---

## 🚀 INSTALACIÓN Y USO

### Opción 1: Uso Local (Sin servidor)
1. Descargar todos los archivos en una carpeta
2. Abrir el archivo `index.html` en cualquier navegador moderno
3. ¡Listo! El sistema funcionará completamente

### Opción 2: Con Servidor Web
```bash
# Si tienes Python instalado:
python -m http.server 8000

# Si tienes Node.js instalado:
npx http-server

# Luego abrir en el navegador:
http://localhost:8000
```

### Opción 3: Deploy en Netlify/Vercel (GRATIS)

**Netlify:**
1. Crear cuenta en https://www.netlify.com
2. Arrastrar la carpeta del proyecto a Netlify Drop
3. ¡Sitio en línea en segundos!

**Vercel:**
1. Crear cuenta en https://vercel.com
2. `npm i -g vercel`
3. `vercel` (en la carpeta del proyecto)
4. Seguir instrucciones

---

## 📋 GUÍA DE USO

### 1️⃣ Agregar Clientes
1. Ir a la sección "Clientes" 👥
2. Clic en "Nuevo Cliente"
3. Llenar: Nombre, Grupo, Tipo (Local/Foráneo)
4. Guardar ✨

### 2️⃣ Agregar Recolectores
1. Ir a la sección "Recolectores" 🚚
2. Clic en "Nuevo Recolector"
3. Llenar: Nombre, Grupo
4. Guardar ✨

### 3️⃣ Registrar Ventas
1. Ir a la sección "Ventas" 🛍️
2. Clic en "Nueva Venta"
3. Seleccionar:
   - Cliente (el grupo se llena automáticamente)
   - Recolector
   - Producto (escribir nombre)
   - Estado de pago (Pendiente/Pagado/No Realizó)
   - Cantidad
   - Precio unitario (el total se calcula automáticamente)
4. Guardar Venta ✨
5. Opcional: Imprimir Ticket 🧾

### 4️⃣ Ver Dashboard
1. Ir a "Dashboard" 📊
2. Ver estadísticas en tiempo real
3. Analizar gráficas de ventas

### 5️⃣ Crear Nueva Semana
1. Ir a "Ventas"
2. Clic en "Crear Hoja Nueva ✨"
3. Confirmar acción
4. La semana actual se guarda en historial
5. Nueva tabla en blanco lista para usar

### 6️⃣ Consultar Historial
1. Ir a "Historial" 📚
2. Ver todas las semanas anteriores
3. Ver detalles de cada semana
4. Descargar CSV de cualquier semana

---

## 🖨️ IMPRESIÓN DE TICKETS

### Configuración de Impresora Térmica

**Compatible con:**
- Impresoras térmicas USB
- Impresoras Bluetooth
- Impresoras WiFi
- Tamaño: 58mm o 80mm

**Pasos para configurar:**
1. Conectar impresora térmica a tu dispositivo
2. Instalar drivers del fabricante
3. Configurar como impresora predeterminada
4. En el sistema, registrar venta y dar clic en "Imprimir Ticket"
5. Seleccionar tu impresora térmica
6. ¡Ticket impreso! 🧾✨

**El ticket incluye:**
- Logo kawaii de Bolsi
- Nombre del negocio (JaLi Bzar)
- Fecha y hora
- Cliente y recolector
- Grupo
- Producto, cantidad y precio
- Total
- Mensaje kawaii de despedida

---

## 💾 ALMACENAMIENTO DE DATOS

El sistema usa **LocalStorage** del navegador para guardar todos los datos:
- ✅ No requiere base de datos
- ✅ Datos permanentes (no se borran al cerrar)
- ✅ Funciona sin internet
- ⚠️ Los datos están en el navegador local

**Nota importante:** Los datos se guardan en el navegador que estés usando. Si cambias de navegador o computadora, los datos no se transfieren automáticamente.

### Backup Manual
Para hacer respaldo:
1. Ir al Historial
2. Descargar CSV de cada semana
3. Guardar archivos CSV en lugar seguro

---

## 🎨 PERSONALIZACIÓN

### Cambiar Colores
Editar variables CSS en `styles.css`:
```css
:root {
    --rosa-pastel: #FFB6D9;
    --rosa-fuerte: #FF8AB8;
    --lila-pastel: #E6C9FF;
    --celeste-pastel: #B8E6FF;
    --crema: #FFF5E6;
}
```

### Modificar Bolsi
El SVG de Bolsi está en `index.html` línea ~19-36 y puede editarse directamente.

---

## 🌟 CARACTERÍSTICAS TÉCNICAS

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno y responsive
- **JavaScript Vanilla** - Sin dependencias pesadas
- **Chart.js** - Gráficas interactivas
- **LocalStorage** - Persistencia de datos
- **CSS Grid & Flexbox** - Layout responsive
- **Animaciones CSS** - Transiciones suaves
- **Media Queries** - Adaptabilidad total

---

## 📱 COMPATIBILIDAD

### Navegadores
- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Navegadores móviles (iOS/Android)

### Dispositivos
- ✅ PC/Laptop (Windows, Mac, Linux)
- ✅ Tablets (iPad, Android)
- ✅ Smartphones (iPhone, Android)

---

## 🔧 RESOLUCIÓN DE PROBLEMAS

### Los datos no se guardan
- Verificar que el navegador permita LocalStorage
- No usar modo incógnito
- Verificar espacio en el navegador

### La impresión no funciona
- Verificar que la impresora esté conectada
- Instalar drivers correctos
- Seleccionar impresora térmica en el diálogo de impresión
- En Windows: Configurar tamaño de papel personalizado

### Las gráficas no aparecen
- Verificar conexión a internet (Chart.js se carga desde CDN)
- Recargar la página
- Verificar que no haya bloqueadores de contenido

---

## 📞 SOPORTE

Para preguntas o soporte:
1. Revisar este README completo
2. Verificar la consola del navegador (F12) para errores
3. Asegurar que todos los archivos estén en la misma carpeta

---

## 🎀 CARACTERÍSTICAS KAWAII

- 💗 Mascota Bolsi en header (con animación bounce)
- 🌸 Paleta de colores pastel profesional
- ✨ Micro-interacciones en todos los botones
- 🎨 Efectos hover suaves
- 💫 Animaciones de entrada/salida
- 🧁 Tipografía redondeada y amigable
- 🌈 Estados de pago con colores distintivos
- 🎪 Notificaciones kawaii animadas

---

## 📊 FLUJO DE TRABAJO RECOMENDADO

1. **Inicio de día:**
   - Abrir Dashboard
   - Revisar estadísticas

2. **Durante el día:**
   - Registrar ventas conforme se realizan
   - Imprimir tickets para clientes
   - Actualizar estados de pago

3. **Fin de día:**
   - Revisar Dashboard
   - Verificar pedidos pendientes
   - Hacer notas si es necesario

4. **Fin de semana:**
   - Crear nueva hoja de semana
   - Descargar CSV de la semana terminada
   - Comenzar semana nueva

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

Si deseas expandir el sistema en el futuro:
- [ ] Integración con base de datos en la nube
- [ ] Sistema de usuarios/login
- [ ] Reportes en PDF
- [ ] Integración con WhatsApp
- [ ] Modo oscuro
- [ ] Múltiples sucursales
- [ ] Inventario de productos
- [ ] Notificaciones push

---

## 📄 LICENCIA

Este sistema fue desarrollado específicamente para **JaLi Bzar**.
Todos los derechos reservados © 2025 JaLi Bzar

---

## ✨ ¡DISFRUTA TU SISTEMA KAWAII! ✨

**Desarrollado con 💗 para JaLi Bzar**

¡Gracias por confiar en este sistema! 🎀
Si tienes dudas o necesitas ayuda, no dudes en preguntar.

---

### 🎯 RESUMEN RÁPIDO

1. Abrir `index.html` en navegador
2. Agregar clientes y recolectores
3. Registrar ventas
4. Imprimir tickets
5. Ver estadísticas en Dashboard
6. Crear nueva semana cuando sea necesario
7. ¡Disfrutar del sistema kawaii! 💗✨

---

**Versión:** 1.0.0  
**Fecha:** Noviembre 2025  
**Desarrollado para:** JaLi Bzar 🎀