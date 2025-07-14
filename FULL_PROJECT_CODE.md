
This file contains the full code for your project. You can use this to recreate the files on your local machine.

---
### File: `package.json`
---
```json
{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "lucide-react": "^0.475.0",
    "next": "15.3.3",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---
### File: `next.config.ts`
---
```ts
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig;
```

---
### File: `firebase.json`
---
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---
### File: `.firebaserc`
---
```json
{
  "projects": {
    "default": "photon-prep"
  }
}
```

---
### File: `src/app/layout.tsx`
---
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
// import { AiAssistant } from "@/components/ai/AiAssistant";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "PHOTON - IIT JEE & NEET COACHING IN VARANASI",
  "alternateName": "PHOTON Coaching Varanasi",
  "url": "https://photoncoaching.in",
  "logo": "https://photoncoaching.in/icon.svg", 
  "description": "PHOTON is Varanasi's leading coaching institute for IIT-JEE (Main + Advanced) and NEET preparation. Founded by physicist Jai Prakash Mishra, we offer expert faculty, proven results, and affordable fees for classes 11, 12, and droppers.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "New Colony Kakarmatta, Sundarpur, Nagwa",
    "addressLocality": "Varanasi",
    "addressRegion": "UP",
    "postalCode": "221004",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-79059-27527",
    "contactType": "customer service"
  },
  "founder": {
    "@type": "Person",
    "name": "Jai Prakash Mishra"
  },
  "knowsAbout": [
    "IIT-JEE Coaching",
    "NEET Coaching",
    "JEE Main",
    "JEE Advanced",
    "Medical Entrance Exam",
    "Engineering Entrance Exam",
    "Class 11 & 12 Physics",
    "Class 11 & 12 Chemistry",
    "Class 11 & 12 Maths"
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL('https://photoncoaching.in'),
  title: {
    template: "%s | PHOTON - Best Coaching for IIT-JEE & NEET in Varanasi",
    default: "PHOTON - Best Coaching for IIT-JEE & NEET in Varanasi",
  },
  description: "PHOTON is the top coaching institute in Varanasi for JEE Main, JEE Advanced, and NEET-UG preparation. Expert faculty, proven results, and affordable fees. Enroll now!",
  keywords: ["best coaching in varanasi", "jee coaching varanasi", "neet coaching varanasi", "iit coaching in varanasi", "class 11 coaching", "class 12 coaching", "photon varanasi", "jai prakash mishra"],
  alternates: {
    canonical: "https://photoncoaching.in", 
  },
  openGraph: {
    title: "PHOTON - Best Coaching for IIT-JEE & NEET in Varanasi",
    description: "Join Varanasi's leading institute for engineering and medical entrance exams. Get mentored by the best faculty and achieve top ranks.",
    url: "https://photoncoaching.in", 
    siteName: "PHOTON Coaching Varanasi",
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-body antialiased">
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        {/* <AiAssistant /> */}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
```

---
### File: `src/app/page.tsx`
---
```tsx
import { Award, BookOpen, Target, Users, GraduationCap, Briefcase, Lightbulb, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | PHOTON - Best Coaching for IIT-JEE & NEET in Varanasi',
  description: 'Welcome to PHOTON, Varanasi\'s #1 coaching institute for JEE & NEET. Offering online and offline classes with a proven track record of success. Admissions open for Class 11, 12, and Droppers.',
  keywords: "best coaching in varanasi, jee coaching varanasi, neet coaching varanasi, iit coaching in varanasi, coaching for class 11 in varanasi, coaching for class 12 in varanasi, photon varanasi, jai prakash mishra",
};

const stats = [
  {
    icon: <Briefcase className="h-10 w-10 text-primary" />,
    value: '16+',
    label: 'Years of excellence',
  },
  {
    icon: <GraduationCap className="h-10 w-10 text-primary" />,
    value: '10,000+',
    label: 'Students Coached',
  },
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    value: 'Proven Results',
    label: 'in JEE & NEET',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    value: 'Core Expert Team',
    label: 'Direct Mentorship',
  },
];

const features = [
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Expert Faculty from Varanasi',
    description: 'Learn directly from our dedicated core team of IITians and Doctors, who are masters in their fields.',
  },
  {
    icon: <Target className="h-10 w-10 text-primary" />,
    title: 'Proven Results in JEE & NEET',
    description: 'Our track record of producing top rankers in Varanasi speaks for itself. Your success is our mission.',
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: 'Innovative Coaching Pedagogy',
    description: 'We use modern, engaging teaching methods to make complex topics simple and clear.',
  },
];

const courses = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "JEE Coaching (Advanced)",
    description: "A comprehensive program designed to tackle the toughest problems in the JEE Advanced syllabus for engineering aspirants in Varanasi."
  },
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "NEET Coaching for Medical",
    description: "In-depth coverage of the complete NEET Biology, Physics, and Chemistry syllabus with a focus on conceptual understanding."
  },
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: "Foundation Course (Class IX & X)",
    description: "Build a strong base in Science and Mathematics to excel in future competitive exams right here in Varanasi."
  }
];

const testimonials = [
  {
    name: 'Anjali Singh',
    achievement: 'IIT Aspirant',
    testimony: 'The faculty at PHOTON is exceptional. Their guidance was pivotal in my journey to cracking IIT.',
    alt: 'Anjali Singh, a successful JEE Advanced student from PHOTON coaching in Varanasi.'
  },
  {
    name: 'Rahul Kanwar',
    achievement: 'JEE Aspirant',
    testimony: 'Thanks to the structured curriculum and regular mock tests, I could excel in my JEE preparation.',
    alt: 'Rahul Kanwar, a JEE aspirant who benefited from PHOTON\'s coaching methodology.'
  },
];

export default function Home() {
  return (
    <>
      <div className="flex flex-col bg-background">
        <section data-last-deployment={new Date().toISOString()} className="relative w-full overflow-hidden bg-blue-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-1 gap-8 items-center py-20 md:py-32">
              <div className="relative z-10 text-center md:text-left">
                <div className="inline-flex items-center rounded-full bg-accent/20 px-4 py-1.5 text-sm font-semibold text-accent-foreground mb-4">
                  <Zap className="h-4 w-4 mr-2" />
                  Admissions Open for 2025-26
                </div>
                <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-primary tracking-tighter">
                  Unlock Your Potential
                </h1>
                <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-tight mt-1">
                  Coaching for JEE & NEET in Varanasi
                </h2>
                <p className="mt-4 max-w-xl mx-auto md:mx-0 text-lg text-muted-foreground">
                  Join Varanasi's leading institute for <strong className="text-gray-700">JEE (Main + Advanced) & NEET-UG</strong>. We are now enrolling for both <strong className="text-gray-700">Online & Offline</strong> batches for Class 11, 12, and Droppers.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button asChild size="lg" className="font-headline bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg px-8 py-6 text-base">
                    <a href="tel:7905927527">Enquire Now <ArrowRight className="ml-2 h-5 w-5"/></a>
                  </Button>
                   <Button asChild size="lg" variant="outline" className="font-headline px-8 py-6 text-base">
                    <Link href="/courses">View Courses</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="stats" className="w-full py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  {stat.icon}
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Why Choose PHOTON Coaching?</div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl text-gray-800">The PHOTON Advantage in Varanasi</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We are committed to providing an environment where students can thrive and achieve excellence in competitive exams like IIT-JEE and NEET.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-6 bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="font-headline text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section id="pst" className="w-full py-20 md:py-24" style={{ backgroundColor: '#00a8e8' }}>
          <div className="container mx-auto px-4 md:px-6 text-center text-white">
              <h2 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">
                  Ace Your Preparation with <span className="text-white">PST</span>
              </h2>
              <p className="mt-2 text-lg font-semibold">(PHOTON Sunday Tests)</p>

              <div className="my-8 inline-block bg-white/30 rounded-lg px-6 py-2">
                <p className="font-headline text-4xl sm:text-5xl font-black" style={{ color: '#ff8c00' }}>
                    COMPLETELY FREE
                </p>
              </div>

              <p className="max-w-3xl mx-auto text-lg">
                  Measure your performance against thousands of students at our Varanasi center or online, identify your weak areas, and get a real-time All India Rank before the actual exam. Don't miss this golden opportunity!
              </p>
              <div className="mt-10">
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg px-10 py-6 text-base font-bold rounded-lg">
                      <Link href="/contact">Register Now <ArrowRight className="ml-2 h-4 w-4"/></Link>
                  </Button>
              </div>
          </div>
        </section>

        <section id="courses" className="w-full py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Our Courses</div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl text-gray-800">Coaching Courses Tailored for Success</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We offer a range of courses for both JEE and NEET aspirants in Varanasi, from foundational to advanced levels for Class 11, 12 and droppers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {courses.map((course, index) => (
                <Card key={index} className="p-6 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-4">
                    {course.icon}
                    <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
                  </div>
                  <p className="mt-4 text-muted-foreground">{course.description}</p>
                  <Link href="/courses" className="text-primary font-semibold mt-4 inline-flex items-center group">
                    Learn more <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
                  <Button asChild size="lg" className="font-headline bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                      <Link href="/courses">View All Coaching Programs <ArrowRight className="ml-2 h-5 w-5"/></Link>
                  </Button>
              </div>
          </div>
        </section>

        <section id="testimonials" className="w-full py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">Testimonials</div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter text-center sm:text-5xl mt-2 text-gray-800">Success Stories from Our Students in Varanasi</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-center mt-4">
                Hear what our past students have to say about their experience at PHOTON coaching.
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 pt-12 md:grid-cols-2">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white shadow-md rounded-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      
                      <div className="flex-1">
                        <p className="text-muted-foreground">"{testimonial.testimony}"</p>
                        <div className="mt-4 font-bold font-headline">{testimonial.name}</div>
                        <div className="text-sm text-primary font-semibold">{testimonial.achievement}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
```

---
### File: `src/components/layout/Header.tsx`
---
```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/courses", label: "Courses" },
  { href: "/faculty", label: "Faculty" },
  { href: "/fees", label: "Fees" },
  { href: "/results", label: "Testimonials" },
  { href: "/contact", label: "Contact Us" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-lg border-b"
          : "bg-white"
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs bg-white p-0">
                <SheetTitle>
                  <VisuallyHidden>Mobile Navigation Menu</VisuallyHidden>
                </SheetTitle>
                <div className="flex justify-between items-center p-4 border-b">
                   <Link href="/" className="flex items-center gap-2">
                    <span className="font-headline text-4xl font-black text-primary">
                      PHOTON
                    </span>
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>
                <nav className="flex flex-col space-y-2 p-4">
                  {navLinks.map((link) => (
                    <SheetTrigger asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "font-headline text-lg font-medium transition-colors py-2 rounded-md px-2",
                          pathname === link.href
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:text-primary hover:bg-muted"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetTrigger>
                  ))}
                  <div className="border-t pt-4 mt-4">
                     <Button asChild className="w-full font-headline bg-accent text-accent-foreground hover:bg-accent/90">
                      <Link href="/contact">Enquire Now</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-4xl font-black text-primary">
              PHOTON
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-headline text-sm font-medium text-gray-700 transition-all px-4 py-2 rounded-lg",
                 pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-primary/5 hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="tel:7905927527" className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
            <Phone className="w-5 h-5 text-primary" />
             <span className="sr-only">Call Us</span>
          </a>
          <Button asChild className="font-headline hidden lg:flex bg-accent text-accent-foreground hover:bg-accent/90 rounded-full shadow-lg">
            <Link href="/contact">Enquire Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

---
### File: `src/components/layout/Footer.tsx`
---
```tsx
import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-headline text-3xl font-black text-primary">
                PHOTON
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Varanasi's Premier Coaching Institute.
              <br />
              © {new Date().getFullYear()} PHOTON Inc. All rights reserved. (Static Deployment)
            </p>
          </div>
          
          <div>
            <h3 className="font-headline text-sm font-semibold text-gray-800">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-primary">About Us</Link></li>
              <li><Link href="/courses" className="text-sm text-muted-foreground transition-colors hover:text-primary">Courses</Link></li>
              <li><Link href="/faculty" className="text-sm text-muted-foreground transition-colors hover:text-primary">Faculty</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline text-sm font-semibold text-gray-800">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact Us</Link></li>
               <li><Link href="/faq" className="text-sm text-muted-foreground transition-colors hover:text-primary">FAQs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-headline text-sm font-semibold text-gray-800">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Privacy Policy</a></li>
            </ul>
          </div>
          
        </div>
        <div className="mt-8 border-t pt-8 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Follow Us</p>
             <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-primary"><Facebook className="h-5 w-5"/></a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground transition-colors hover:text-primary"><Twitter className="h-5 w-5"/></a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-primary"><Instagram className="h-5 w-5"/></a>
            </div>
        </div>

      </div>
    </footer>
  );
}
```

---
### File: `src/app/contact/page.tsx`
---
```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const ContactForm = () => {
  return (
    <form className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your Name" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" placeholder="your.email@example.com" disabled />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="e.g., JEE Course Inquiry" disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="Your message here..." className="min-h-[120px]" disabled />
      </div>
      <Button type="submit" className="w-full font-headline" disabled>
        Send Message
      </Button>
    </form>
  );
};


const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 md:py-20">
      <header className="text-center mb-16">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl">Get in Touch</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          We're here to help. Reach out to us with any questions or to start your journey with PHOTON.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <Card className="animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Send us a Message</CardTitle>
            <CardDescription>Our contact form is temporarily unavailable. Please call us instead.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
        
        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">New Colony Kakarmatta, Sundarpur, Nagwa, Varanasi, Shivdaspur, Uttar Pradesh 221004</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <a href="tel:7905927527" className="text-muted-foreground hover:text-primary transition-colors">(+91) 79059 27527</a>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <span className="text-muted-foreground">jpm2005physics@gmail.com</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
             <CardHeader>
              <CardTitle className="font-headline text-2xl">Find Us Here</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Link href="https://maps.app.goo.gl/Kfnu6LMgmru4oAfw7?g_st=aw" target="_blank" rel="noopener noreferrer" className="block relative">
                 <div className="absolute inset-0 bg-transparent z-10"></div>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3607.728741834244!2d82.9863475752174!3d25.2795328287955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e31b504953c89%3A0x86701b58535f49bc!2sPHOTON%20-%20IIT%20JEE%20%26%20NEET%20COACHING%20IN%20VARANASI!5e0!3m2!1sen!2sin!4v1721832961858!5m2!1sen!2sin" 
                  width="100%" 
                  height="256" 
                  style={{ border: 0 }}
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="pointer-events-none"
                ></iframe>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

```
