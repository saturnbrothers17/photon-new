"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import PageLoader from "@/components/ui/page-loader";


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