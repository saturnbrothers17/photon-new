import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from 'lucide-react';
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Testimonials | PHOTON Coaching Varanasi",
  description: "Read student success stories and testimonials from PHOTON Coaching Varanasi.",
};

const testimonials = [
  {
    initial: "P",
    name: "Priya Sharma",
    designation: "NEET Aspirant",
    quote: "The faculty at PHOTON is exceptional. Their personalized attention and rigorous test series in Varanasi were pivotal. The study material is comprehensive and helped me build a very strong foundation for NEET.",

    rating: 5,
  },
  {
    initial: "R",
    name: "Rohan Verma",
    designation: "JEE Aspirant",
    quote: "Thanks to the structured curriculum and regular mock tests at this Varanasi coaching center, I was able to master complex concepts and significantly improve my problem-solving speed for JEE.",

    rating: 4,
  },
  {
    initial: "M",
    name: "Mrs. Gupta",
    designation: "Parent",
    quote: "PHOTON provides a very competitive yet supportive environment. The teachers are more like mentors who guide their students at every step. We are grateful for their constant motivation.",

    rating: 5,
  },
  {
    initial: "A",
    name: "Amit Patel",
    designation: "Alumnus, IIT BHU",
    quote: "The quality of teaching for JEE at PHOTON is unparalleled in Varanasi. The weekly tests helped me track my progress and identify areas for improvement. Highly recommended!",

    rating: 5,
  },
  {
    initial: "S",
    name: "Sneha Reddy",
    designation: "Medical Aspirant",
    quote: "The strategic approach to covering the syllabus and the emphasis on revision techniques at PHOTON were game-changers. It is the best place for serious medical aspirants in Varanasi.",

    rating: 4,
  },
  {
    initial: "V",
    name: "Vikram Singh",
    designation: "JEE Aspirant",
    quote: "I owe my success to the entire team at PHOTON. Their guidance on time management and exam strategy was as important as their teaching of the core subjects. A truly holistic preparation experience for JEE.",

    rating: 5,
  },
  {
    initial: "K",
    name: "Kavya Singh",
    designation: "JEE Aspirant",
    quote: "PHOTON's comprehensive study material and dedicated doubt-clearing sessions were instrumental in my JEE preparation. The faculty's support made complex topics easy to understand.",

    rating: 4,
  },
  {
    initial: "A",
    name: "Arjun Kumar",
    designation: "NEET Aspirant",
    quote: "The mock tests at PHOTON are incredibly realistic and helped me manage my time effectively during the actual NEET exam. The personalized feedback was invaluable.",

    rating: 5,
  },
  {
    initial: "D",
    name: "Deepika Sharma",
    designation: "Parent",
    quote: "My daughter's confidence has soared since joining PHOTON. The teachers are not just educators but true mentors who genuinely care about their students' success.",

    rating: 5,
  },
  {
    initial: "M",
    name: "Mohit Yadav",
    designation: "Alumnus, AIIMS Delhi",
    quote: "The rigorous academic environment combined with the supportive faculty at PHOTON helped me achieve my dream of getting into AIIMS. Forever grateful for their guidance.",

    rating: 4,
  },
  {
    initial: "S",
    name: "Shruti Gupta",
    designation: "Medical Aspirant",
    quote: "PHOTON's focus on conceptual clarity and problem-solving techniques made all the difference. The regular assessments kept me on track and motivated throughout my journey.",

    rating: 5,
  },
  {
    initial: "V",
    name: "Vivek Sharma",
    designation: "JEE Aspirant",
    quote: "The competitive yet collaborative atmosphere at PHOTON pushed me to excel. The faculty's deep knowledge and approachable nature made learning enjoyable and effective.",

    rating: 4,
  },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-100 to-blue-50 py-20 md:py-32 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-blue-800 tracking-tighter mb-4">
            Student Success Stories from Varanasi
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            We are proud of our students' achievements in JEE and NEET. Here's what they have to say about
            their experience at PHOTON, the best coaching institute in Varanasi.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative bg-blue-50 p-6 rounded-lg shadow-md border border-blue-100 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-blue-700 font-bold text-xl">{testimonial.initial}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-blue-800">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.designation}</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Quote className="absolute -top-4 -left-4 w-8 h-8 text-blue-300 opacity-75 transform -scale-x-100" />
                  <p className="text-muted-foreground mb-4 italic pl-6">{testimonial.quote}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
