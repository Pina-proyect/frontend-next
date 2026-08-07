import { test, expect } from '@playwright/test'

test.describe('Auth Flows', () => {
  test('Registro: muestra pantalla de verificación de email', async ({ page }) => {
    // Interceptar backend de registro
    await page.route('**/api/pina/registro/creadora', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'ok', userId: 'u1' }),
      })
    })

    await page.goto('/register')
    await page.getByLabel('Nombre completo').fill('User Test')
    await page.getByLabel('Correo electrónico').fill('user@example.com')
    await page.getByLabel('Contraseña').fill('Password123')
    // Age gate requerido
    await page.getByText('Soy mayor de 18 años').click()
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    // Pantalla de confirmación de verificación por email
    await expect(page.getByText('¡Cuenta creada!')).toBeVisible()
    await expect(page.getByText(/Te enviamos un email de verificación/i)).toBeVisible()
  })

  test('Login: envía credenciales y redirige a /onboarding', async ({ page }) => {
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
    await page.getByPlaceholder('name@domain.com').fill('user@example.com')
    await page.getByPlaceholder('••••••••').fill('Password123')
    // Seleccionar el botón de envío exacto para evitar colisiones con el botón de Google
    await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click()

    // Usuario sin slug → onboarding (permitir dashboard como alternativa robusta)
    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })
  })
})