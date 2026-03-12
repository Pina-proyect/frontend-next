## Estado Actual Verificado
- No existe `app/` en la raíz; todo está bajo `src/app`.
- Estructura presente:
  - `src/app/(public)/login/page.tsx`, `src/app/(public)/register/page.tsx`, `src/app/(public)/auth/callback/page.tsx`, `src/app/(public)/layout.tsx`
  - `src/app/(app)/dashboard/page.tsx`
  - `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Paleta PINA y mapeos HSL activos en `src/app/globals.css`; Tailwind mapea `success` y demás colores en `tailwind.config.ts` y escanea `./src/**/*`.

## Objetivo
- Asegurar que todas las rutas usen `src/app/layout.tsx` y el layout público `src/app/(public)/layout.tsx` para centrar contenido y aplicar branding lavanda/violeta.
- Eliminar cualquier archivo duplicado si reaparece y corregir solapamientos visuales en páginas públicas.

## Pasos de Implementación
1. Auditoría de directorios
- Confirmar que no existan restos: `app/`, `app/layout.tsx`, `app/lib/http-client.ts`.
- Si reaparecen, mover/eliminar para que el único origen sea `src/app/` y `src/lib/`.

2. Consolidación de rutas (idempotente)
- Verificar que `(public)` y `(app)` viven en `src/app/` y mantienen los mismos paths.
- Asegurar que `src/app/(public)/layout.tsx` envuelve `login`, `register` y `auth/callback` (centrado con `bg-background` y `text-foreground`).

3. Corrección de superposición visual
- Reemplazar separadores ad hoc por un componente `Separator` de UI (Shadcn/Tailwind) en `login` y `register` para evitar `absolute`/`inset-0` que causan solapamiento.
- Mantener utilidades Tailwind basadas en variables: `bg-card`, `text-card-foreground`, `border-input`, `ring`, `bg-primary`.

4. Limpieza y compatibilidad
- Asegurar que tests importen rutas desde `src/app/(public)`.
- Verificar alias `@` apunta a `src/` y no hay referencias al antiguo `app/` raíz.

5. Validación
- Activar Corepack y Yarn del proyecto (`yarn@4.11.0`).
- Ejecutar `yarn lint` y `yarn test` para asegurar estabilidad.
- Levantar `yarn dev:4011`, abrir `http://localhost:4011/login` y `http://localhost:4011/register`.
- Validar branding: fondos lavanda (`bg-background`), tarjetas (`bg-card`), texto (`text-foreground`), botones (`bg-primary`). Confirmar que el contenido está centrado y sin solapamientos.

## Buenas Prácticas y Seguridad
- Mantener Shadcn/UI + Tailwind como única base de UI. Evitar librerías externas.
- No duplicar `http-client`; usar `src/lib/http-client.ts` con cookies HttpOnly y flujos de refresh seguros.
- No exponer secretos en cliente; `NEXT_PUBLIC_API_URL` sólo debe ser URL pública.

## Entregables y Commit
- Estructura consolidada en `src/app` y visual sin solapamientos.
- Commit recomendado:
  - `feat(routes): consolidate app router under src/app`
  - `fix(ui): prevent overlap in public pages and apply PINA theme`

¿Confirmas que proceda con estos pasos? En cuanto apruebes, ejecuto la consolidación idempotente, aplico el `Separator` en `register` (si corresponde), limpio duplicados y valido en dev server con lint y tests.