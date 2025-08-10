import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>PHOTON - IIT JEE & NEET Coaching</title>
        <meta name="description" content="Best coaching for IIT JEE & NEET in Varanasi" />
      </head>
      <body>
        <div style={{ padding: '20px', minHeight: '100vh' }}>
          <header style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <h1 style={{ color: '#0066cc', margin: 0 }}>PHOTON Coaching Institute</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>IIT JEE & NEET Preparation</p>
          </header>
          <main>
            {children}
          </main>
          <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc', textAlign: 'center', color: '#666' }}>
            <p>&copy; 2024 PHOTON Coaching Institute. All rights reserved.</p>
          </footer>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}