// Resolución de idioma para las sugerencias IA según el país del creador.
// REQ-FE-5: default español; países hispanohablantes → es, Brasil → pt,
// países angloparlantes → en.

const SPANISH_COUNTRIES = new Set([
  'argentina', 'españa', 'spain', 'méxico', 'mexico', 'colombia', 'chile',
  'perú', 'peru', 'venezuela', 'ecuador', 'bolivia', 'paraguay', 'uruguay',
  'guatemala', 'honduras', 'el salvador', 'nicaragua', 'costa rica', 'panamá',
  'panama', 'cuba', 'república dominicana', 'republica dominicana', 'puerto rico',
  'equatorial guinea',
])

const ENGLISH_COUNTRIES = new Set([
  'estados unidos', 'united states', 'usa', 'uk', 'reino unido', 'united kingdom',
  'canadá', 'canada', 'australia', 'nueva zelanda', 'new zealand', 'irlanda',
  'ireland', 'nigeria', 'ghana', 'sudáfrica', 'south africa', 'filipinas',
  'philippines', 'india', 'singapur', 'singapore',
])

const PORTUGUESE_COUNTRIES = new Set(['brasil', 'brazil', 'portugal'])

function normalize(value: string | undefined | null): string {
  return (value ?? '').trim().toLowerCase()
}

export function resolveLanguage(country: string | undefined | null): string {
  const normalized = normalize(country)
  if (!normalized) return 'es'
  if (PORTUGUESE_COUNTRIES.has(normalized)) return 'pt'
  if (ENGLISH_COUNTRIES.has(normalized)) return 'en'
  if (SPANISH_COUNTRIES.has(normalized)) return 'es'
  // Desconocido: español por defecto (mercado principal)
  return 'es'
}
