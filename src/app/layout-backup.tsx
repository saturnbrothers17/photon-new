import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '20px' }}>
          <h1>PHOTON - Minimal Layout Test</h1>
          {children}
        </div>
      </body>
    </html>
  );
}