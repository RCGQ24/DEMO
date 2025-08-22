# Demo App - Sistema de Gestión

Una aplicación web móvil completa que demuestra un flujo de trabajo para gestión de áreas y procesos, con funcionalidades avanzadas de captura de medios.

## 🚀 Características

### 📱 Diseño Responsivo
- Optimizada para dispositivos móviles
- Interfaz intuitiva y moderna
- Navegación fluida entre pantallas

### 🔐 Autenticación
- Pantalla de login con validación
- Credenciales de prueba:
  - Usuario: `Augusto.fragiel`, Contraseña: `Sistema2025`
  - Usuario: `user`, Contraseña: `123456`

### 📋 Flujo de Trabajo
1. **Login** - Autenticación de usuario
2. **Selección de Área** - Lista de áreas disponibles
3. **Selección de Proceso** - Configuración de proceso y sub-proceso
4. **Descripción y Adjuntos** - Captura de información y archivos
5. **Resultado y Observación** - Registro final del proceso

### 📸 Funcionalidades Avanzadas

#### Cámara y Fotos
- Captura directa desde la cámara del dispositivo
- Interfaz de cámara en pantalla completa
- Fallback a selector de archivos si no hay cámara

#### Carga de Archivos
- Selección de imágenes desde galería
- Carga de cualquier tipo de archivo
- Vista previa de archivos adjuntos
- Gestión de archivos (agregar/remover)

#### Grabación de Audio
- Grabación de audio en tiempo real
- Interfaz visual durante la grabación
- Indicadores de estado (grabando/detenido)

### 💾 Persistencia de Datos
- Guardado automático en sessionStorage
- Recuperación de datos al navegar
- Auto-guardado cada 30 segundos

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos y responsive
- **JavaScript ES6+** - Funcionalidad completa
- **Web APIs** - MediaDevices, File API, MediaRecorder

## 📁 Estructura del Proyecto

```
DEMO/
├── index.html              # Archivo principal
├── css/
│   ├── global.css          # Estilos globales
│   ├── login.css           # Estilos de login
│   ├── area-selection.css  # Estilos de selección de área
│   ├── description.css     # Estilos de descripción
│   └── result.css          # Estilos de resultado
├── js/
│   ├── app.js              # Aplicación principal
│   ├── login.js            # Funcionalidad de login
│   ├── area-selection.js   # Selección de área
│   ├── description.js      # Descripción y adjuntos
│   └── result.js           # Resultado y observación
└── README.md               # Este archivo
```

## 🚀 Cómo Usar

### Instalación
1. Descarga o clona el proyecto
2. Abre `index.html` en un navegador web
3. Para funcionalidades completas, usa un servidor local

### Servidor Local (Recomendado)
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (si tienes http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

Luego visita `http://localhost:8000`

### Credenciales de Prueba
- **Admin**: `admin` / `123456`
- **Usuario**: `user` / `123456`

## 📱 Funcionalidades Móviles

### Cámara
- Acceso directo a la cámara del dispositivo
- Captura de fotos en alta resolución
- Interfaz optimizada para móviles

### Archivos
- Selección desde galería de fotos
- Carga de documentos y archivos
- Vista previa y gestión de adjuntos

### Audio
- Grabación de audio con micrófono
- Indicadores visuales de grabación
- Formato WAV para compatibilidad

## 🔧 Configuración Avanzada

### Permisos del Navegador
Para funcionalidades completas, el navegador debe permitir:
- Acceso a la cámara
- Acceso al micrófono
- Acceso a archivos

### Compatibilidad
- **Chrome/Edge**: Funcionalidad completa
- **Firefox**: Funcionalidad completa
- **Safari**: Funcionalidad básica (limitaciones de MediaRecorder)
- **Móviles**: Optimizado para iOS y Android

## 🎨 Personalización

### Colores
Los colores principales se pueden modificar en `css/global.css`:
- Color primario: `#4CAF50`
- Color secundario: `#4a90e2`
- Fondo: `#f0f8ff`

### Estilos
Cada pantalla tiene su propio archivo CSS para facilitar la personalización.

## 📊 Datos y Almacenamiento

### SessionStorage
- Datos temporales durante la sesión
- Se pierden al cerrar el navegador
- Ideal para demos y pruebas

### LocalStorage
- Usuario actual persistente
- Se mantiene entre sesiones

## 🐛 Solución de Problemas

### Cámara no funciona
- Verifica permisos del navegador
- Usa HTTPS en producción
- Prueba en modo incógnito

### Audio no graba
- Verifica permisos del micrófono
- Algunos navegadores requieren HTTPS
- Safari tiene limitaciones conocidas

### Archivos no se cargan
- Verifica el tamaño del archivo
- Algunos tipos pueden estar restringidos
- Prueba con archivos más pequeños

## 🔮 Próximas Mejoras

- [ ] Integración con backend real
- [ ] Sincronización en la nube
- [ ] Modo offline
- [ ] Notificaciones push
- [ ] Geolocalización
- [ ] Escaneo de códigos QR

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Desarrollado con ❤️ para demostrar capacidades web modernas**
