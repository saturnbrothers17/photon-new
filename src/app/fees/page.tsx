import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Wallet, Handshake, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: "Fees | PHOTON Coaching Varanasi",
  description: "Understand the transparent fee structure and scholarship opportunities at PHOTON Coaching Varanasi.",
};

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-100 to-blue-50 py-20 md:py-32 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-blue-800 tracking-tighter mb-4">
            An Investment in Future, Not an Expense
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            At PHOTON, we are committed to one simple belief: every deserving student should have access to
            the highest quality education. We've built our reputation in Varanasi on this principle, providing
            unparalleled coaching that is both exceptional and affordable.
          </p>
        </div>
      </section>

      {/* Why Parents Trust PHOTON's Value Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-blue-800 mb-12">
            Why Parents Trust PHOTON's Value
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
            We deliver what others promise, at a cost that respects your family's budget.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800 mb-2">Top-Tier Faculty at an Honest Price</h3>
              <p className="text-muted-foreground text-sm">
                Your child deserves the best mentorship. We make it accessible by offering guidance
                from IITians and experienced educators without the premium price tag common in
                the industry.
              </p>
            </Card>

            <Card className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800 mb-2">Transparent & Flexible Plans</h3>
              <p className="text-muted-foreground text-sm">
                We believe in clear, upfront communication. Our team will walk you
                through flexible payment options designed to reduce your financial burden, with no
                hidden costs.
              </p>
            </Card>

            <Card className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800 mb-2">Scholarships for Meritorious Students</h3>
              <p className="text-muted-foreground text-sm">
                We believe talent should be nurtured, not held back by financial constraints. We
                proudly offer significant scholarships to deserving students based on merit.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">
            Find the Perfect Plan for Your Child
          </h2>
          <p className="max-w-3xl mx-auto text-lg mb-8">
            Our admission counselors are here to help you understand our straightforward fee structure. They
            will provide a clear breakdown of course fees, explain our interest-free installment plans, and
            discuss scholarship eligibility. Let's build your child's success story together.
          </p>
          <Button asChild className="font-headline bg-orange-500 text-white hover:bg-orange-600 shadow-lg px-8 py-6 text-base transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
            <Link href="tel:9450545318">Contact Admissions <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
