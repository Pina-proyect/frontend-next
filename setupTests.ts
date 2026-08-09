// Configuración global de pruebas
import '@testing-library/jest-dom';

// Mocks comunes para Next.js
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpieza del DOM entre tests (crítico con pool vmThreads + isolate:false,
// donde el registro de módulos se comparte entre archivos de test).
afterEach(() => {
  cleanup();
});

// Los mocks de @/lib/http-client y @/store/use-auth-store se declaran POR
// ARCHIVO DE TEST con el patrón del repo (factory sin referencias externas +
// import dinámico en el test). Cada archivo es un thread worker con su propio
// registro de mocks; no se comparte estado entre archivos.

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});
