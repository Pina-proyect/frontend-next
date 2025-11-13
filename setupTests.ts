// Configuración global de pruebas
import '@testing-library/jest-dom';

// Mocks comunes para Next.js
import { vi } from 'vitest';

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});