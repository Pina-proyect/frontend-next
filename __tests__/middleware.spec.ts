import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

function makeRequest(url: string, cookieHeader?: string) {
  const headers = new Headers();
  if (cookieHeader) headers.set('cookie', cookieHeader);
  const req = new Request(url, { headers });
  return new NextRequest(req);
}

describe('middleware /dashboard protection', () => {
  it('redirige a /login cuando no hay cookies de sesión', () => {
    const req = makeRequest('http://localhost:4011/dashboard');
    const res = middleware(req);
    // NextResponse tiene propiedad "headers" y "status" y URL en "headers.get('location')"
    expect(res.headers.get('location')).toContain('/login');
  });

  it('permite acceso cuando hay refresh_token', () => {
    const req = makeRequest('http://localhost:4011/dashboard', 'refresh_token=abc123');
    const res = middleware(req);
    // Cuando permite, no debería tener location de redirección
    expect(res.headers.get('location')).toBeNull();
  });

  it('permite acceso cuando hay refreshToken', () => {
    const req = makeRequest('http://localhost:4011/dashboard', 'refreshToken=xyz456');
    const res = middleware(req);
    expect(res.headers.get('location')).toBeNull();
  });
});