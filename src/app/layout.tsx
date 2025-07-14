"use client";

import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import PageLoader from "@/components/ui/page-loader";
import Script from "next/script";


// import { AiAssistant } from "@/components/ai/AiAssistant";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" className="!scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />

        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="YOUR_GSC_VERIFICATION_CODE" />

        {/* Google Analytics - Global Site Tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_MEASUREMENT_ID"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'YOUR_GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body className="font-body antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>

        <Footer />

        <Toaster />
      </body>
    </html>
  );
}