import { test, expect } from '@playwright/test'

test.describe('Auth Flows', () => {
  test('Registro: muestra toast y redirige a /login', async ({ page }) => {
    // Interceptar backend de registro
    await page.route('**/api/pina/registro/creadora', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'pending', message: 'ok', userId: 'u1' }),
      })
    })

    await page.goto('/register')
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Nombre completo').fill('User Test')
    await page.getByLabel('Contraseña').fill('Password123')
    await page.getByLabel('Fecha de nacimiento').fill('1990-01-01')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    // Toast y redirección
    await expect(page.getByText('Registro iniciado')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('Login: envía credenciales y redirige a /dashboard', async ({ page }) => {
    // Interceptar backend de login
    await page.route('**/api/pina/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'at',
          refreshToken: 'rt',
          user: { id: '1', email: 'user@example.com', fullName: 'User', provider: 'local', tokenVersion: 1 },
        }),
      })
    })

    await page.goto('/login')
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Contraseña').fill('Password123')
    // Seleccionar el botón de envío exacto para evitar colisiones con el botón de Google
    await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click()
    // Simular cookie de sesión colocada por el backend (necesaria para pasar el middleware)
    await page.context().addCookies([
      { name: 'refreshToken', value: 'rt', domain: 'localhost', path: '/' },
    ])

    await expect(page).toHaveURL(/\/dashboard$/)
  })
})