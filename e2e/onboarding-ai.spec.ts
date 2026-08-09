import { test, expect, type Page } from '@playwright/test'

// ── mocks de backend (API mockeada, sin backend real) ──────────────────────

const USER = {
  id: 'u1',
  email: 'ana@example.com',
  fullName: 'Ana Pérez',
  provider: 'google',
  tokenVersion: 1,
  slug: null,
  role: 'CREATOR',
  gender: 'creadora',
}

function mockAuth(page: Page, user: Record<string, unknown> = USER) {
  // Login
  void page.route('**/api/pina/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'at', refreshToken: 'rt', user }),
    })
  })
  // PATCH de perfil (paso 2 y paso 3)
  void page.route('**/api/pina/auth/profile', async (route) => {
    const req = route.request()
    if (req.method() === 'PATCH') {
      const body = JSON.parse(req.postData() ?? '{}')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...user, ...body, slug: body.slug ?? user.slug ?? 'ana' }),
      })
      return
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) })
  })
  // /auth/me del layout
  void page.route('**/api/pina/auth/me', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) })
  })
  // Dashboard
  void page.route('**/api/pina/creators/*/donations', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  void page.route('**/api/pina/media/my-content', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  void page.route('**/api/pina/packs/my-packs', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  void page.route('**/api/pina/notifications/unread-count', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 0 }) })
  })
}

const SUGGESTIONS = {
  suggestedNiche: 'Fotografía',
  suggestedBio: 'Narrativa visual a través del lente.',
  suggestedGoal: { title: 'Cámara profesional', amount: 50000, currency: 'ARS' },
  suggestedPlan: ['Publicar 3 veces por semana', 'Crear un pack de presets'],
}

const CASE_A_RESPONSE = {
  case: 'A',
  reasons: [],
  degraded: false,
  suggestions: SUGGESTIONS,
}

async function completeOnboardingToStep3(page: Page) {
  // Login → redirige a /onboarding (user sin slug)
  await page.goto('/login')
  await page.getByPlaceholder('name@domain.com').fill('ana@example.com')
  await page.getByPlaceholder('••••••••').fill('Password123')
  await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click()
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })

  // Paso 1: nicho
  await page.getByText('Fotografía', { exact: true }).first().click()
  await page.getByRole('button', { name: /Siguiente Paso/i }).click()

  // Paso 2: perfil
  await page.getByPlaceholder('e.g. elena-rodriguez').fill('ana-perez')
  await page.getByPlaceholder('Ej: Argentina, España, México...').fill('Argentina')
  await page.getByRole('button', { name: /Ya casi estamos/i }).click()

  // Paso 3 visible
  await expect(page.getByRole('heading', { name: /Conecta y Lanza/i })).toBeVisible()
  await expect(page.getByText('Paso 3 de 3')).toBeVisible()
}

test.describe('Onboarding IA (v1.18) — API mockeada', () => {
  test('flujo completo caso A: 3 pasos → análisis → tarjetas editables → guardar → dashboard con plan', async ({ page }) => {
    mockAuth(page)

    // Análisis IA → caso A
    void page.route('**/api/pina/ai/profile/analyze', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CASE_A_RESPONSE) })
    })

    await completeOnboardingToStep3(page)

    // Consent gate: botón deshabilitado sin consentimiento
    const analyzeBtn = page.getByRole('button', { name: /Analizar con IA/i })
    await expect(analyzeBtn).toBeDisabled()

    // Aceptar consentimiento → analizar
    await page.getByLabel(/Acepto que Pina analice/i).check()
    await expect(analyzeBtn).toBeEnabled()
    await analyzeBtn.click()

    // Tarjetas editables (caso A)
    await expect(page.getByText(/Tu plan sugerido por IA/i)).toBeVisible()
    await expect(page.getByLabel('Nicho')).toHaveValue('Fotografía')

    // Editar y guardar → dashboard con "Tu plan Pina"
    await page.getByLabel('Nicho').fill('Fotografía Documental')
    await page.getByRole('button', { name: /Guardar plan/i }).click()

    await page.waitForURL(/\/(dashboard)/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: 'Tu plan Pina' })).toBeVisible()
    await expect(page.getByText(/Fotografía Documental/i).first()).toBeVisible()
  })

  test('caso D: IA no disponible (503) → degrada a flujo manual y no bloquea', async ({ page }) => {
    mockAuth(page)

    // Análisis IA → 503 (providers down)
    void page.route('**/api/pina/ai/profile/analyze', async (route) => {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'El servicio de IA no está disponible' }) })
    })

    await completeOnboardingToStep3(page)

    await page.getByLabel(/Acepto que Pina analice/i).check()
    await page.getByRole('button', { name: /Analizar con IA/i }).click()

    // Flujo manual disponible (caso D)
    await expect(page.getByRole('button', { name: /Lanzar Estudio/i })).toBeVisible()
  })

  test('429: límite diario → mensaje + flujo manual', async ({ page }) => {
    mockAuth(page)

    void page.route('**/api/pina/ai/profile/analyze', async (route) => {
      await route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ message: 'Llegaste al límite diario de generaciones con IA' }) })
    })

    await completeOnboardingToStep3(page)

    await page.getByLabel(/Acepto que Pina analice/i).check()
    await page.getByRole('button', { name: /Analizar con IA/i }).click()

    await expect(page.getByRole('alert').filter({ hasText: /límite diario/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Lanzar Estudio/i })).toBeVisible()
  })

  test('dashboard: plan oculto cuando el creador no aceptó IA (aiPlanAccepted=false)', async ({ page }) => {
    mockAuth(page, { ...USER, slug: 'bruno', aiPlanAccepted: false })

    await page.goto('/login')
    await page.getByPlaceholder('name@domain.com').fill('bruno@example.com')
    await page.getByPlaceholder('••••••••').fill('Password123')
    await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click()
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })

    await page.goto('/dashboard')
    await expect(page.getByText(/¡Hola/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tu plan Pina' })).toHaveCount(0)
  })
})
