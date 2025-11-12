export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root layout requerido por Next.js App Router.
  // Debe incluir etiquetas <html> y <body>.
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}