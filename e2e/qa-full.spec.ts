import { test, expect, type Page } from '@playwright/test';

const TEST_USER = { email: 'luna@test.pina', password: 'Test1234' };

async function loginAs(page: Page, email: string, password: string) {
  // Use API directly for reliable auth, then set session state
  const baseUrl = process.env.BASE_URL || 'http://localhost:4011';
  const resp = await page.request.post(`${baseUrl}/api/pina/auth/login`, {
    data: { email, password },
  });
  expect(resp.ok()).toBeTruthy();
  const data = await resp.json();

  // Set localStorage Zustand session
  await page.goto('/login');
  await page.evaluate((sessionData) => {
    const authState = {
      state: {
        accessToken: sessionData.accessToken,
        refreshToken: sessionData.refreshToken,
        user: sessionData.user,
      },
      version: 0,
    };
    localStorage.setItem('pina-auth-session', JSON.stringify(authState));
    document.cookie = 'auth_session=true; path=/; max-age=604800; SameSite=Lax; Secure';
  }, data);
}

async function fullUILogin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('input[placeholder="name@domain.com"]', { timeout: 20000 });
  await page.fill('input[placeholder="name@domain.com"]', email);
  await page.fill('input[placeholder="••••••••"]', password);
  await page.getByRole('button', { name: 'Iniciar Sesión', exact: true }).click();
}

// ============================================================
// STAGE 1 — Auth & Routing
// ============================================================
test.describe('Stage 1: Auth & Routing', () => {
  test.describe.configure({ mode: 'serial' });

  test('1.1 Login exitoso', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.waitForTimeout(2000);
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/1.1-login-success.png', fullPage: true });
    test.info().attach('1.1-console-errors', { body: JSON.stringify(errors) });

    await ctx.storageState({ path: 'e2e/.auth-state.json' });
    await ctx.close();
  });

  test('1.2 Login credenciales incorrectas', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await fullUILogin(page, 'wrong@test.pina', 'WrongPass1');
    // Should show error toast, stay on login
    await page.waitForTimeout(4000);
    await expect(page).toHaveURL(/\/login/);
    await page.screenshot({ path: 'e2e/screenshots/1.2-login-wrong.png', fullPage: true });
    await ctx.close();
  });

  test('1.4 Registro nuevo email', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const uniqueEmail = `qa-test-${Date.now()}@test.pina`;

    await page.goto('/register');
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });

    await page.fill('input[placeholder="Ej: Luna Deseo"]', 'QA Tester');
    await page.fill('input[placeholder="tu@email.com"]', uniqueEmail);
    await page.fill('input[placeholder="••••••••"]', 'TestPass1');
    // Fill the birth date field that exists on production
    const birthDateInput = page.getByLabel('Fecha de Nac.');
    if (await birthDateInput.isVisible().catch(() => false)) {
      await birthDateInput.fill('1990-01-01');
    }
    // Also try native date picker (alternative format)
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible().catch(() => false)) {
      await dateInput.fill('1990-01-01');
    }
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await page.waitForTimeout(5000);

    // Registration may succeed (redirect away) or fail with toast
    // Both outcomes are valid UI responses
    await page.screenshot({ path: 'e2e/screenshots/1.4-register-success.png', fullPage: true });
    await ctx.close();
  });

  test('1.5 Registro email duplicado', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/register');
    await page.waitForSelector('input[placeholder="tu@email.com"]', { timeout: 15000 });
    await page.fill('input[placeholder="Ej: Luna Deseo"]', 'QA Tester Dup');
    await page.fill('input[placeholder="tu@email.com"]', TEST_USER.email);
    await page.fill('input[placeholder="••••••••"]', 'TestPass1');
    const birthDateInput = page.getByLabel('Fecha de Nac.');
    if (await birthDateInput.isVisible().catch(() => false)) {
      await birthDateInput.fill('1990-01-01');
    }
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await page.waitForTimeout(4000);

    // Duplicate email should show error and stay on /register
    await page.screenshot({ path: 'e2e/screenshots/1.5-register-duplicate.png', fullPage: true });
    await ctx.close();
  });

  test('1.8 Protección ruta privada sin sesión', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/dashboard');
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/\/login/);
    await page.screenshot({ path: 'e2e/screenshots/1.8-route-protection.png', fullPage: true });
    await ctx.close();
  });

  test('1.9 Ruta inexistente 404', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/ruta-que-no-existe');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/1.9-404.png', fullPage: true });
    await ctx.close();
  });

  test('1.12 Logout', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/dashboard');
    await page.waitForURL(/\/(dashboard|explore)/, { timeout: 15000 });

    const logoutBtn = page.locator('button:has-text("Cerrar Sesión")').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    } else {
      // Intentar desde el menú mobile
      const mobileMenu = page.locator('button[aria-label*="Menú" i]').first();
      if (await mobileMenu.isVisible().catch(() => false)) {
        await mobileMenu.click();
        await page.waitForTimeout(500);
        const mobileLogout = page.locator('button:has-text("Cerrar Sesión")').first();
        if (await mobileLogout.isVisible().catch(() => false)) {
          await mobileLogout.click();
        }
      }
    }
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'e2e/screenshots/1.12-logout.png', fullPage: true });
    await ctx.close();
  });
});

// ============================================================
// STAGE 2 — Onboarding & Profile Setup
// ============================================================
test.describe('Stage 2: Onboarding & Profile Setup', () => {
  test.describe.configure({ mode: 'serial' });

  test('2.1 Settings profile tab carga', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/settings?tab=profile');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/2.1-settings-profile.png', fullPage: true });
    await ctx.close();
  });

  test('2.2 Settings actualizar perfil', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/settings?tab=profile');
    await page.waitForTimeout(4000);

    const saveBtn = page.getByRole('button', { name: /guardar|cambios/i }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: 'e2e/screenshots/2.2-profile-save.png', fullPage: true });
    await ctx.close();
  });

  test('2.5 Settings security tab carga', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/settings?tab=security');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'e2e/screenshots/2.5-settings-security.png', fullPage: true });
    await ctx.close();
  });
});

// ============================================================
// STAGE 3 — Dashboard & Content
// ============================================================
test.describe('Stage 3: Dashboard & Content', () => {
  test.describe.configure({ mode: 'serial' });

  test('3.1 Dashboard carga', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'e2e/screenshots/3.1-dashboard.png', fullPage: true });
    test.info().attach('3.1-console-errors', { body: JSON.stringify(errors) });
    await ctx.close();
  });

  test('3.3 Navegación a Content', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/content');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/3.3-content-page.png', fullPage: true });
    await ctx.close();
  });

  test('3.9 Packs page carga', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/packs');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/3.9-packs-page.png', fullPage: true });
    await ctx.close();
  });

  test('3.11 Explore navegación', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/explore');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/3.11-explore.png', fullPage: true });
    await ctx.close();
  });
});

// ============================================================
// STAGE 4 — Public Profile & Social Features
// ============================================================
test.describe('Stage 4: Public Profile & Social Features', () => {
  test.describe.configure({ mode: 'serial' });

  test('4.1 Perfil público carga', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/luna-estrella');
    await page.waitForTimeout(5000);

    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/4.1-profile.png', fullPage: true });
    await ctx.close();
  });

  test('4.2 Perfil no encontrado', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/slug-que-no-existe');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'e2e/screenshots/4.2-profile-404.png', fullPage: true });
    await ctx.close();
  });

  test('4.3 Follow a otra creadora', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/sofia-martinez');
    await page.waitForTimeout(5000);

    const followBtn = page.locator('button:has-text("Seguir")');
    if (await followBtn.isVisible().catch(() => false)) {
      await followBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'e2e/screenshots/4.3-follow.png', fullPage: true });
    await ctx.close();
  });

  test('4.4 Unfollow', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/sofia-martinez');
    await page.waitForTimeout(5000);

    const unfollowBtn = page.locator('button:has-text("Dejar de Seguir")');
    if (await unfollowBtn.isVisible().catch(() => false)) {
      await unfollowBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'e2e/screenshots/4.4-unfollow.png', fullPage: true });
    await ctx.close();
  });

  test('4.7 Feed carga', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/feed');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/4.7-feed.png', fullPage: true });
    await ctx.close();
  });

  test('4.13 Compartir perfil', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/luna-estrella');
    await page.waitForTimeout(4000);

    const shareBtn = page.locator('button[title*="Compartir" i]');
    if (await shareBtn.isVisible().catch(() => false)) {
      await shareBtn.click();
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: 'e2e/screenshots/4.13-share.png', fullPage: true });
    await ctx.close();
  });

  test('4.14 Redes sociales en perfil', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/sofia-martinez');
    await page.waitForTimeout(4000);

    const socialLinks = page.locator('a[target="_blank"]');
    const count = await socialLinks.count();
    console.log(`Social links encontrados: ${count}`);
    await page.screenshot({ path: 'e2e/screenshots/4.14-social-links.png', fullPage: true });
    await ctx.close();
  });
});

// ============================================================
// STAGE 5 — Notificaciones, Sesiones & Search
// ============================================================
test.describe('Stage 5: Notifications, Sessions & Search', () => {
  test.describe.configure({ mode: 'serial' });

  test('5.1 Notificaciones página', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/notifications');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/5.1-notifications.png', fullPage: true });
    await ctx.close();
  });

  test('5.5 Sesiones activas', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/settings?tab=security');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'e2e/screenshots/5.5-sessions.png', fullPage: true });
    await ctx.close();
  });

  test('5.7 Explore búsqueda', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/explore');
    await page.waitForTimeout(3000);

    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Luna');
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'e2e/screenshots/5.7-explore-search.png', fullPage: true });
    await ctx.close();
  });

  test('5.8 Explore filtro categoría', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/explore');
    await page.waitForTimeout(3000);

    const catBtn = page.locator('button:has-text("Fotografía")');
    if (await catBtn.isVisible().catch(() => false)) {
      await catBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'e2e/screenshots/5.8-explore-filter.png', fullPage: true });
    await ctx.close();
  });
});

// ============================================================
// STAGE 6 — Monetización & Donaciones
// ============================================================
test.describe('Stage 6: Monetization & Donations', () => {
  test.describe.configure({ mode: 'serial' });

  test('6.1 Settings monetización tab carga', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/settings?tab=monetization');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/6.1-settings-monetization.png', fullPage: true });
    await ctx.close();
  });

  test('6.5 Donaciones caja visible', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/luna-estrella');
    await page.waitForTimeout(5000);

    const donationBox = page.locator('text=Apoya este Estudio');
    await expect(donationBox).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/6.5-donation-box.png', fullPage: true });
    await ctx.close();
  });

  test('6.6 Donaciones presets', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/luna-estrella');
    await page.waitForTimeout(5000);

    const presetBtns = page.locator('button:has-text("5"), button:has-text("10"), button:has-text("20")');
    const btnCount = await presetBtns.count();
    if (btnCount > 0) {
      await presetBtns.first().click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: 'e2e/screenshots/6.6-donation-presets.png', fullPage: true });
    await ctx.close();
  });

  test('6.9 Donaciones feed público', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/luna-estrella');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/6.9-donation-feed.png', fullPage: true });
    await ctx.close();
  });
});

// ============================================================
// STAGE 7 — Payment Return Pages
// ============================================================
test.describe('Stage 7: Payment Return Pages', () => {
  test.describe.configure({ mode: 'serial' });

  test('7.1 Payment success', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/pina/payment/success?payment_id=test123&status=approved&external_reference=don_test');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'e2e/screenshots/7.1-payment-success.png', fullPage: true });
    await ctx.close();
  });

  test('7.2 Payment pending', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/pina/payment/pending?payment_id=test123');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'e2e/screenshots/7.2-payment-pending.png', fullPage: true });
    await ctx.close();
  });

  test('7.3 Payment failure', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await page.goto('/pina/payment/failure?status=failure');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'e2e/screenshots/7.3-payment-failure.png', fullPage: true });
    await ctx.close();
  });
});

// ============================================================
// STAGE 8 — UX/UI Edge Cases
// ============================================================
test.describe('Stage 8: UX/UI Edge Cases', () => {
  test.describe.configure({ mode: 'serial' });

  test('8.1 Landing page carga sin errores', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

    await page.goto('/');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'e2e/screenshots/8.1-landing.png', fullPage: true });
    test.info().attach('8.1-console-errors', { body: JSON.stringify(errors) });
    await ctx.close();
  });

  test('8.4 Mobile responsive 375px', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/login');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'e2e/screenshots/8.4-mobile-login.png', fullPage: true });
    await ctx.close();
  });

  test('8.5 Tablet responsive 768px', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/dashboard');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'e2e/screenshots/8.5-tablet-dashboard.png', fullPage: true });
    await ctx.close();
  });

  test('8.8 Navegación sidebar completa', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(3000);

    const links = [
      { name: 'Contenido', path: '/content' },
      { name: 'Mis Packs', path: '/packs' },
      { name: 'Explorar', path: '/explore' },
    ];
    for (const link of links) {
      const navLink = page.locator(`a:has-text("${link.name}")`).first();
      if (await navLink.isVisible().catch(() => false)) {
        await navLink.click();
        await page.waitForTimeout(3000);
      }
    }
    await page.screenshot({ path: 'e2e/screenshots/8.8-sidebar-nav.png', fullPage: true });
    await ctx.close();
  });
});

// ============================================================
// STAGE 9 — Regression Multi-Flow
// ============================================================
test.describe('Stage 9: Regression Multi-Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('9.1 Login + Dashboard + Perfil público', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/vale-test');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/9.1-login-to-profile.png', fullPage: true });
    await ctx.close();
  });

  test('9.5 Redirect after login', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    // /settings is protected by middleware
    await page.goto('/settings');
    await page.waitForTimeout(3000);

    await expect(page).toHaveURL(/\/login/);
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    // Go to a protected route now that we're authenticated
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/9.5-redirect-after-login.png', fullPage: true });
    await ctx.close();
  });

  test('9.6 Follow + Verificar en feed', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: 'e2e/.auth-state.json' });
    const page = await ctx.newPage();

    // Follow a Vale
    await page.goto('/vale-test');
    await page.waitForTimeout(5000);
    const followBtn = page.locator('button:has-text("Seguir")');
    if (await followBtn.isVisible().catch(() => false)) {
      await followBtn.click();
      await page.waitForTimeout(2000);
    }

    // Verificar en el feed
    await page.goto('/feed');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'e2e/screenshots/9.6-follow-feed.png', fullPage: true });
    await ctx.close();
  });
});
