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
  { href: "/testimonials", label: "Testimonials" },
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
                    <span className="font-headline text-4xl font-black text-blue-600">
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
                          "relative font-headline text-lg font-medium py-2 px-2 rounded-md transition-transform duration-300 hover:-translate-x-1 hover:scale-105 hover:text-blue-600 before:absolute before:inset-0 before:rounded-md before:bg-blue-600/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
                          pathname === link.href
                            ? "bg-primary/10 text-blue-600"
                            : "text-foreground/80 hover:text-blue-600 hover:bg-muted"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetTrigger>
                  ))}
                  <div className="border-t pt-4 mt-4">
                     <Button asChild className="w-full font-headline bg-orange-600 text-white hover:bg-orange-700">
                      <Link href="tel:7905927527">Enquire Now</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-4xl font-black text-blue-600">
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
                "relative font-headline text-sm font-medium text-gray-700 px-4 py-2 rounded-lg transition-transform duration-300 hover:-translate-y-1 hover:scale-110 hover:text-blue-600 before:absolute before:inset-0 before:rounded-lg before:bg-blue-600/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
                 pathname === link.href
                  ? "bg-primary/10 text-blue-600"
                  : "hover:bg-primary/5 hover:text-blue-600"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="tel:7905927527" className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
            <Phone className="w-5 h-5 text-blue-600" />
             <span className="sr-only">Call Us</span>
          </a>
          <Button asChild className="font-headline hidden lg:flex bg-orange-600 text-white hover:bg-orange-700 rounded-full shadow-lg">
            <Link href="tel:7905927527">Enquire Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}