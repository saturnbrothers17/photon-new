"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from 'lucide-react';

export function PopupForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [classOption, setClassOption] = useState("");
  const [preparingFor, setPreparingFor] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenPopup");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setSubmitMessage("Submitting...");

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          classOption,
          preparingFor,
          email,
        }),
      });

      if (response.ok) {
        setSubmitMessage("Thank you for your submission!");
        localStorage.setItem("hasSeenPopup", "true");
        setTimeout(() => setIsOpen(false), 2000); // Close after 2 seconds
      } else {
        setSubmitMessage("Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitMessage("An error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] p-8 rounded-2xl shadow-2xl bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full mix-blend-overlay blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full mix-blend-overlay blur-xl"></div>
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-white text-center">🚀 Unlock Your Success Journey! 🚀</DialogTitle>
          <DialogDescription className="text-white/90 text-center mb-4">
            Get personalized guidance and kickstart your path to JEE/NEET excellence. Fill out the form now!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 text-black bg-white/90" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone (WhatsApp)</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3 text-black bg-white/90" type="tel" pattern="[0-9]{10}" placeholder="e.g., 9876543210" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="class" className="text-right">Class</Label>
            <Select onValueChange={setClassOption} value={classOption} required>
              <SelectTrigger className="col-span-3 text-black bg-white/90">
                <SelectValue placeholder="Select your class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="11">Class 11</SelectItem>
                <SelectItem value="12">Class 12</SelectItem>
                <SelectItem value="dropper">Dropper</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="preparingFor" className="text-right">Preparing For</Label>
            <Select onValueChange={setPreparingFor} value={preparingFor} required>
              <SelectTrigger className="col-span-3 text-black bg-white/90">
                <SelectValue placeholder="Select what you're preparing for" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JEE">JEE</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
                <SelectItem value="Academics">Academics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email ID</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3 text-black bg-white/90" type="email" placeholder="e.g., example@domain.com" required />
          </div>
          <Button type="submit" className="w-full font-headline bg-orange-500 text-white hover:bg-orange-600 mt-4" disabled={isSubmitted}>
            {isSubmitted ? submitMessage : "Submit Enquiry"} <ArrowRight className="ml-2 h-5 w-5"/>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
