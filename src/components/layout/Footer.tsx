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