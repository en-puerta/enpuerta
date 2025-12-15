# Mejoras de Layout Mobile y Mapa de Ubicación

## ✅ Cambios Implementados

### 1. Grid de Eventos en Mobile - 2 Columnas
**Archivo:** `event-list.html`
- **Antes:** `grid-cols-1` (1 evento por fila en mobile)
- **Ahora:** `grid-cols-2` (2 eventos por fila en mobile)
- **Gap reducido:** `gap-4 sm:gap-6` para mejor aprovechamiento del espacio

**Beneficio:** Mejor uso del espacio en pantallas móviles, más eventos visibles sin scroll.

---

### 2. Carrusel de Destacados - Vista 1.5 Eventos
**Archivo:** `event-list.html`
- **Antes:** `w-full` (1 evento completo en mobile)
- **Ahora:** `w-[70%]` (muestra 1 evento + 30% del siguiente)
- **Gap reducido:** `gap-4` (antes `gap-6`)
- **Margen negativo:** `-mx-6 px-6` para que el carrusel llegue hasta los bordes

**Beneficio:** Hint visual de que hay más contenido, invita al usuario a hacer scroll horizontal.

---

### 3. Sección "Cómo Llegar" con Mapa
**Archivos:** `event-detail.html`, `event-detail.ts`

#### HTML Agregado:
- **Título con ícono:** "Cómo llegar" con ícono de mapa
- **Dirección:** Muestra `event.locationAddress`
- **Mapa embebido:** Google Maps iframe responsive
  - Mobile: `h-64` (256px)
  - Desktop: `h-80` (320px)
- **Link directo:** "Abrir en Google Maps" para navegación

#### TypeScript:
```typescript
getMapUrl(address: string): SafeResourceUrl {
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedAddress}`;
  return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
}
```

**Imports agregados:**
- `DomSanitizer` y `SafeResourceUrl` de `@angular/platform-browser`

**Beneficio:** Los usuarios pueden ver exactamente dónde está el evento sin salir de la página.

---

## 📊 Impacto en Bundle Size
- **Antes:** 773 kB
- **Ahora:** 781.65 kB
- **Incremento:** +8.65 kB (principalmente por DomSanitizer)

---

## 🚀 Deploy
**URL:** https://enpuerta-public.web.app
**Status:** ✅ Live

---

## 📱 Responsive Breakpoints

### Grid de Eventos:
- **Mobile:** 2 columnas (`grid-cols-2`)
- **Desktop:** 3 columnas (`lg:grid-cols-3`)

### Carrusel Destacados:
- **Mobile:** 70% width (muestra ~1.5 eventos)
- **Tablet:** 50% width (`sm:w-[calc(50%-8px)]`)
- **Desktop:** 33.33% width (`lg:w-[calc(33.333%-11px)]`)

### Mapa:
- **Mobile:** 256px height
- **Desktop:** 320px height

---

## 🎨 Estilo Consistente
- Usa colores `primary` del sitio
- Bordes `border-slate-200`
- Iconos con `bg-primary/10`
- Transiciones suaves en hover
