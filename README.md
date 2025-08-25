# 🍅 Tómate un Desayuno

Aplicación web para la **gestión colaborativa de pedidos de desayuno en grupos**. Permite crear grupos, que las personas se unan y gestionen sus pedidos individuales con cálculo automático de totales y sincronización en tiempo real.

## ✨ Características

### 👥 **Gestión de Grupos**
- Crear grupos de desayuno con IDs únicos (`TOMATE-12345`)
- Unirse a grupos existentes con nombre de persona
- Sincronización en tiempo real entre todos los participantes
- Limpieza automática de grupos inactivos (5 minutos sin actividad)

### 🛒 **Gestión de Pedidos**
- Sistema de menú con productos y suplementos
- Cálculo automático de precios por persona
- Edición en tiempo real de pedidos individuales
- Totales por persona y grupo actualizados automáticamente

### 🔐 **Panel de Administración**
- Acceso seguro mediante **Google OAuth**
- Control de acceso por lista de emails autorizados
- Vista de todos los grupos activos con estadísticas
- Gestión completa: ver detalles, marcar como pagado, eliminar
- Registro de accesos para auditoría

### 💾 **Persistencia y Sesiones**
- Reconexión automática tras cerrar/abrir navegador
- Validación de grupos activos al reconectar
- Datos almacenados en Firebase Realtime Database
- Sin pérdida de datos entre sesiones

## 🚀 Tecnologías

- **Frontend**: [Astro](https://astro.build) v5.12.9 + [Lit](https://lit.dev) v3.3.1
- **Backend**: [Firebase Realtime Database](https://firebase.google.com/products/realtime-database)
- **Autenticación**: Google OAuth via Firebase Auth
- **Despliegue**: Firebase Hosting
- **Desarrollo**: Firebase Emulators Suite

## 📋 Requisitos Previos

- Node.js 18+ 
- Firebase CLI (`npm install -g firebase-tools`)
- Proyecto Firebase configurado
- Variables de entorno configuradas

## ⚙️ Configuración

### 1. **Clonar e Instalar**
```bash
git clone https://github.com/manufosela/tomate-undesayuno.git
cd tomate-undesayuno
npm install
```

### 2. **Variables de Entorno**
Crear archivo `.env` en la raíz con la configuración de Firebase:

```env
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_DATABASE_URL=https://your-project-rtdb.region.firebasedatabase.app
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdefgh
```

### 3. **Configurar Usuarios Autorizados**
En Firebase Console o Emulator UI, crear la entrada:
```json
{
  "authorizedUsers": [
    "admin@example.com",
    "manager@example.com"
  ]
}
```

## 🛠️ Comandos de Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con emulador Firebase |
| `npm run dev:no-emulator` | Servidor de desarrollo con Firebase en producción |
| `npm run emulator` | Solo emulador Firebase (puerto 9000) |
| `npm run emulator:ui` | Emulador con interfaz web (puerto 4000) |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |
| `npm run generate-firebase-config` | Regenerar configuración Firebase |

## 🏗️ Estructura del Proyecto

```
├── public/
│   ├── js/
│   │   ├── components/          # Componentes Lit
│   │   │   ├── app-controller.js           # Controlador principal
│   │   │   ├── admin-app-controller.js     # Controlador admin
│   │   │   ├── admin-login.js              # Login Google OAuth
│   │   │   ├── admin-panel.js              # Dashboard admin
│   │   │   ├── grupo-selector.js           # Crear/unirse a grupos
│   │   │   ├── personas-manager-grupo.js   # Gestión de pedidos
│   │   │   └── modal-system.js             # Sistema de modales
│   │   ├── services/            # Servicios de negocio
│   │   │   ├── firebase-service.js         # Inicialización Firebase
│   │   │   ├── auth-service.js             # Autenticación Google
│   │   │   ├── grupo-service.js            # Lógica de grupos
│   │   │   └── session-service.js          # Gestión de sesiones
│   │   └── data/
│   │       └── menu-data.js                # Datos del menú
│   └── css/
│       └── global.css           # Estilos globales
├── src/
│   ├── pages/
│   │   ├── index.astro          # Página principal
│   │   └── admin.astro          # Panel de administración
│   └── layouts/
│       └── Layout.astro         # Layout base
├── scripts/
│   └── generate-firebase-config.js   # Generador de configuración
├── database.rules.json          # Reglas de seguridad Firebase
├── firebase.json               # Configuración Firebase
└── package.json               # Dependencias y scripts
```

## 🌐 Uso de la Aplicación

### **Para Usuarios Finales**

1. **Acceder a la aplicación** en la URL desplegada
2. **Crear un grupo nuevo**:
   - Clic en "Crear grupo de desayuno"
   - Se genera un ID único (`TOMATE-12345`)
   - Compartir el ID con el grupo
3. **Unirse a un grupo existente**:
   - Clic en "Unirse a grupo de desayuno"  
   - Introducir ID del grupo y nombre de persona
4. **Gestionar pedido**:
   - Seleccionar productos del menú
   - Añadir suplementos opcionales
   - Ver total actualizado en tiempo real
5. **Colaborar en tiempo real**:
   - Ver pedidos de otras personas del grupo
   - Totales actualizados automáticamente
   - Cambios sincronizados instantáneamente

### **Para Administradores**

1. **Acceder al panel admin** en `/admin`
2. **Iniciar sesión** con Google (solo emails autorizados)
3. **Supervisar grupos**:
   - Vista de todos los grupos activos
   - Estadísticas de uso y facturación
   - Detalles completos de cada pedido
4. **Gestionar estado**:
   - Marcar grupos como pagados
   - Eliminar grupos finalizados
   - Monitorizar actividad en tiempo real

## 🔧 Configuración Avanzada

### **Firebase Emulators**
Para desarrollo local con datos de prueba:
```bash
npm run dev  # Arranca emulador automáticamente
```
- **Base de datos**: puerto 9000
- **Interfaz web**: puerto 4000 (`http://127.0.0.1:4000`)

### **Producción sin Emulador**
Para probar con datos reales:
```bash
npm run dev:no-emulator
```

### **Reglas de Seguridad**
Las reglas en `database.rules.json` permiten:
- Lectura/escritura pública en `/desayunos` (datos de grupos)
- Solo lectura autenticada en `/authorizedUsers`
- Escritura de logs de acceso en `/adminAccessLogs`

### **Variables de Build**
El sistema genera automáticamente `public/js/firebase-config.js` con:
- Configuración Firebase desde variables de entorno
- Funciones de detección de emulador
- Helpers para desarrollo/producción

## 🚀 Despliegue

### **Firebase Hosting**
```bash
npm run build
firebase deploy
```

### **Variables de Entorno en Producción**
Configurar las mismas variables `PUBLIC_FIREBASE_*` en el sistema de hosting.

## 🛡️ Seguridad

- **Autenticación**: Google OAuth obligatorio para admin
- **Autorización**: Lista de emails permitidos en base de datos
- **Reglas Firebase**: Acceso controlado por tipo de datos
- **Logs de acceso**: Registro de todos los accesos admin
- **Configuración**: Variables de entorno (nunca en código)

## 📖 Documentación Técnica

Ver [CLAUDE.md](./CLAUDE.md) para documentación técnica detallada y [ARCHITECTURE.md](./ARCHITECTURE.md) para la arquitectura del sistema.

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

**Desarrollado con ❤️ para facilitar los desayunos grupales**