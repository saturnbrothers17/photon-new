"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import styles from './styles.module.css';

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
                <a href="tel:9450545318" className="text-muted-foreground hover:text-primary transition-colors">(+91) 94505 45318</a>
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
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className={`pointer-events-none ${styles.mapFrame}`}
                  title="Location of PHOTON Coaching on Google Maps"
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
