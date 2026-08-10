/** Tipo de medio: video o imagen (según backend Media.type). */
export type MediaType = 'video' | 'image';

/** URL resuelta para visualización (backend MediaUrlResolver). */
export interface ResolvedMedia {
  id: string;
  title: string | null;
  type: MediaType;
  mimetype: string;
  size: number;
  url: string;
  expiresAt?: string;
}

/** Media crudo del backend (my-content / packs). */
export interface MediaItem {
  id: string;
  creatorId: string;
  title: string | null;
  url: string;
  type: MediaType;
  mimetype: string;
  size: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedUrl?: { url: string; expiresAt?: string };
}

/** True si el mimetype corresponde a video. */
export function isVideoType(mimetype: string): boolean {
  return mimetype.startsWith('video/');
}

/** True si el item es video (por type o mimetype). */
export function isVideo(item: { type?: MediaType | string; mimetype?: string }): boolean {
  return item.type === 'video' || isVideoType(item.mimetype ?? '');
}
