**Alcance**

* Ajustar la redirección post-autenticación en Login y Callback OAuth para decidir entre /onboarding y /dashboard según el slug del usuario devuelto por /auth/me.

**Criterio funcional**

* Si /auth/me → user.slug está vacío/undefined: redirigir a /onboarding.

* Si /auth/me → user.slug existe: redirigir a /dashboard.

**Archivos a modificar**

* [login/page.tsx](file:///d:/pina-proyect/frontend-next/src/app/\(public\)/login/page.tsx): tras setAuthSession(), consultar /auth/me con http() y decidir ruta.

* [auth/callback/page.tsx](file:///d:/pina-proyect/frontend-next/src/app/\(public\)/auth/callback/page.tsx):

  * En proceedWithTokens(): ya se consulta /auth/me; cambiar router.push() para evaluar slug.

  * En tryCookieRefresh(): tras setAuthSession(data), consultar /auth/me y decidir ruta.

**Implementación (resumen)**

* Login:

  1. Realizar POST /auth/login.
  2. setAuthSession(response).
  3. GET /auth/me.
  4. const hasSlug = !!me?.slug?.trim(); router.push(hasSlug ? "/dashboard" : "/onboarding").

* Callback OAuth:

  * proceedWithTokens(): obtener user via /auth/me (ya implementado), decidir ruta con hasSlug.

  * tryCookieRefresh(): tras setAuthSession(data), llamar /auth/me, decidir ruta.

**Pruebas**

* Actualizar tests unitarios:

  * login.page.spec.tsx: mock de /auth/me devolviendo slug y sin slug; verificar router.push a /dashboard y /onboarding respectivamente.

  * callback.spec.tsx (si existe): mismo criterio.

**Consideraciones técnicas**

* http() añade Authorization automáticamente tras setAuthSession.

* Mantener toasts existentes; sólo cambiar destino de router.

* No tocar el contrato del backend; sólo lectura de /auth/me.

**Resultado esperado**

* Tras autenticar, si el usuario no completó onboarding (sin slug) -> /onboarding.

* Si usuario con perfil completo (con slug) -> /dashboard.

