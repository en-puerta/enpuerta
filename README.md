# EnPuerta 🎭

Plataforma de gestión y venta de entradas para eventos teatrales y culturales.

## 🚀 Aplicaciones

Este monorepo contiene 3 aplicaciones Angular:

### 1. **EnPuerta Public** (Plataforma Pública)
- **URL**: https://enpuerta-public.web.app
- **Descripción**: Sitio público para descubrir eventos y realizar reservas
- **Features**:
  - Listado de eventos con carrusel de destacados
  - Detalle de eventos con funciones
  - Sistema de reservas en tiempo real
  - Actualización automática de capacidad
  - Diseño responsive y moderno

### 2. **EnPuerta Admin** (Panel de Administración)
- **Descripción**: Panel para gestionar eventos, funciones y reservas
- **Features**:
  - CRUD de eventos
  - Gestión de funciones
  - Visualización de reservas
  - Autenticación con Firebase

### 3. **EnPuerta Check-in** (App de Check-in)
- **Descripción**: Aplicación para validar entradas en el evento
- **Features**:
  - Escaneo de códigos QR
  - Validación de reservas
  - Check-in de asistentes

## 🛠️ Stack Tecnológico

- **Frontend**: Angular 19
- **Styling**: TailwindCSS + SCSS
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **State Management**: RxJS Observables
- **Build**: Angular CLI
- **Package Manager**: npm

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/en-puerta/enpuerta.git
cd enpuerta

# Instalar dependencias
npm install

# Configurar Firebase
# Crear archivo de configuración en cada app:
# projects/enpuerta-public/src/environments/environment.ts
# projects/enpuerta-admin/src/environments/environment.ts
# projects/enpuerta-checkin/src/environments/environment.ts
```

## 🚀 Desarrollo

```bash
# Iniciar app pública
npm run start:public
# http://localhost:4200

# Iniciar app admin
npm run start:admin
# http://localhost:4201

# Iniciar app check-in
npm run start:checkin
# http://localhost:4202
```

## 🏗️ Build

```bash
# Build app pública
npm run build:public

# Build app admin
npm run build:admin

# Build app check-in
npm run build:checkin

# Build todas las apps
npm run build:all
```

## 🚢 Deploy

```bash
# Deploy solo app pública
firebase deploy --only hosting:enpuerta-public

# Deploy solo app admin
firebase deploy --only hosting:enpuerta-admin

# Deploy todas las apps
firebase deploy --only hosting
```

## 📁 Estructura del Proyecto

```
enpuerta/
├── projects/
│   ├── enpuerta-public/      # App pública
│   ├── enpuerta-admin/       # Panel admin
│   ├── enpuerta-checkin/     # App check-in
│   └── enpuerta-shared/      # Librería compartida
├── firebase.json             # Configuración Firebase
├── firestore.rules          # Reglas de seguridad
└── package.json             # Dependencias
```

## 🔒 Seguridad

**⚠️ IMPORTANTE**: Antes de producción, implementar:
- Validación server-side de reservas
- Rate limiting
- CAPTCHA en formularios
- Firestore Security Rules mejoradas

Ver documentación completa en `/docs/public_platform_documentation.md`

## 🌐 URLs de Producción

- **Público**: https://enpuerta-public.web.app
- **Admin**: https://enpuerta-admin.web.app
- **Check-in**: https://enpuerta-checkin.web.app

## 📄 Licencia

Privado - Todos los derechos reservados

## 👥 Equipo

EnPuerta Team

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025
