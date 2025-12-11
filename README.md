# EnPuerta 🎭

**EnPuerta** es una plataforma web integral para la gestión de eventos en vivo (teatro, stand-up, música, talleres). Recientemente refactorizada a una arquitectura de **Monorepo Angular**, separa la lógica en tres aplicaciones especializadas y una librería compartida.

## 🚀 Aplicaciones del Workspace

El proyecto se divide en tres aplicaciones distintas:

### 1. EnPuerta Public (Asistentes)
*   **Proyecto**: `enpuerta-public`
*   **Dominio sugerido**: `eventos.enpuerta.com`
*   **Funcionalidades**:
    *   Descubrimiento de eventos y cartelera.
    *   Detalle de eventos y funciones.
    *   Formularios de reserva y confirmación.

### 2. EnPuerta Admin (Organizadores)
*   **Proyecto**: `enpuerta-admin`
*   **Dominio sugerido**: `admin.enpuerta.com`
*   **Funcionalidades**:
    *   Dashboard de gestión.
    *   CRUD de Eventos y Funciones.
    *   Gestión de Reservas y Pagos.
    *   Vista en vivo de estadísticas.

### 3. EnPuerta Check-in (Control de Acceso)
*   **Proyecto**: `enpuerta-checkin`
*   **Dominio sugerido**: `checkin.enpuerta.com`
*   **Funcionalidades**:
    *   Escáner QR para ingreso rápido (`@zxing/ngx-scanner`).
    *   Resumen de acceso en tiempo real.
    *   Optimizado para dispositivos móviles.

### 📚 EnPuerta Shared (Librería)
*   **Proyecto**: `enpuerta-shared`
*   **Contenido importable**: `@enpuerta/shared`
*   Contiene toda la lógica de negocio central:
    *   **Modelos**: `Event`, `Booking`, `Organization`, etc.
    *   **Servicios**: `AuthService`, `EventService`, `BookingService`.
    *   **Guards**: `AuthGuard`.

---

## 🛠 Stack Tecnológico

- **Frontend**: [Angular](https://angular.io/) (v19+) - Monorepo
- **Estilos**: SASS Modular
- **Backend**: Firebase / Firestore
- **Autenticación**: Firebase Auth

---

## ⚙️ Configuración e Instalación

1.  **Instalar dependencias**
    Debido a algunas dependencias legacy, se recomienda usar el flag correspondiente:
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Configurar Firebase**
    El archivo `environment.ts` se encuentra replicado en cada proyecto (`projects/enpuerta-*/src/environments/`). Asegurate de configurar tus credenciales en los 3 archivos si es necesario (o usar un script de build para inyectarlas).

3.  **Ejecutar las Aplicaciones**

    Para correr cada aplicación localmente:

    *   **Pública**:
        ```bash
        npm run start:public
        # O alternativa manual: npx ng serve enpuerta-public
        ```
        Accesible en `http://localhost:4200/`

    *   **Admin**:
        ```bash
        npm run start:admin
        # O alternativa manual: npx ng serve enpuerta-admin --port 4201
        ```
        Accesible en `http://localhost:4201/`

    *   **Check-in**:
        ```bash
        npm run start:checkin
        # O alternativa manual: npx ng serve enpuerta-checkin --port 4202
        ```
        Accesible en `http://localhost:4202/`

---

## 📂 Nueva Estructura del Monorepo

```text
projects/
├── enpuerta-shared/    # Librería de lógica común
├── enpuerta-public/    # App para venta de entradas
├── enpuerta-admin/     # App para gestión
└── enpuerta-checkin/   # App para escaneo QR
```

---

## 📝 Flujo de Uso (Ejemplo)

1.  **Admin**: Crea un evento en `http://localhost:4201`.
2.  **Público**: Un usuario reserva en `http://localhost:4200`.
3.  **Check-in**: El staff escanea el QR en `http://localhost:4202`.

---
Creado con ❤️ para la comunidad artística.
