'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  expiresAt?: string;
  /** Re-obtiene la URL (ej. re-resolver presigned si expiró). */
  onResolve: () => Promise<string>;
  className?: string;
}

/**
 * Reproductor de video anti-descarga.
 * - Bloquea clic derecho, arrastre y menú contexto.
 * - controlsList=nodownload (oculta botón descargar en navegadores que lo soportan).
 * - Si la URL falla (expirada), muestra mensaje en español + "Reintentar" → onResolve.
 */
export function VideoPlayer({ url, expiresAt, onResolve, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);

  const prevent = useCallback(
    (e: React.SyntheticEvent) => e.preventDefault(),
    [],
  );

  useEffect(() => {
    setCurrentUrl(url);
    setError(null);
  }, [url]);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await onResolve();
      setCurrentUrl(fresh);
      // Recargar el elemento para aplicar la nueva URL.
      requestAnimationFrame(() => {
        videoRef.current?.load();
      });
    } catch {
      setError('No se pudo renovar la URL del video. Intentá de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [onResolve]);

  const handleError = useCallback(() => {
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      setError('La URL del video expiró.');
    } else {
      setError('No se pudo reproducir el video.');
    }
  }, [expiresAt]);

  if (!currentUrl) {
    return (
      <div className="flex items-center justify-center aspect-video bg-surface-container-low rounded-xl text-sm text-on-surface-variant">
        Video no disponible
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-black ${className ?? ''}`}
      onContextMenu={prevent}
      onDragStart={prevent}
    >
      <video
        ref={videoRef}
        key={currentUrl}
        src={currentUrl}
        controls
        controlsList="nodownload"
        draggable={false}
        onError={handleError}
        className="w-full aspect-video"
        playsInline
      />
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 text-white text-sm p-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetry}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label text-sm disabled:opacity-50"
          >
            {loading ? 'Renovando...' : 'Reintentar'}
          </button>
        </div>
      )}
    </div>
  );
}
