import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Target, Users, Lightbulb, ArrowRight, Award, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: "About Us | PHOTON Coaching Varanasi",
  description: "Learn about PHOTON Coaching – our mission, vision, and the team driving student success in IIT-JEE & NEET exams.",
};

const timelineEvents = [
  {
    year: "2009",
    title: "The Genesis in Varanasi",
    description: "In the historic city of Varanasi, PHOTON was founded by the visionary physicist, Jai Prakash Mishra, with an ambition to redefine coaching for competitive exams.",
  },
  {
    year: "2014",
    title: "Celebrating Early Success",
    description: "We enrolled our first batch of students, achieving great results, with many securing admissions in prestigious engineering and medical colleges.",
  },
  {
    year: "2019",
    title: "Digital Revolution",
    description: "Launched our state-of-the-art digital platform, bringing PHOTON's quality teaching beyond Varanasi to students everywhere.",
  },
  {
    year: "2023",
    title: "A Decade of Legacy",
    description: "Recognized as a leading institute with over 10,000 successful stories, becoming a symbol of trust for aspirants in Varanasi and beyond.",
  },
];

const principles = [
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Our Mission",
    description: "To empower students with the knowledge and skills to excel in competitive exams and foster a culture of continuous learning.",
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: "Our Vision",
    description: "To be the most trusted and successful coaching institute, recognized for our innovative teaching and outstanding results in Varanasi and beyond.",
  },
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    title: "Our Values",
    description: "We believe in integrity, dedication, student-centricity, and innovation. These values guide every decision we make.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-blue-50 py-20 md:py-32 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-blue-600 tracking-tighter mb-4">
            Our Story: Rooted in Varanasi, Reaching for the Nation
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            From a focused beginning in the heart of Uttar Pradesh to a leader in competitive exam
            preparation, both offline and online.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-600">
                A Legacy of Shaping Futures
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Founded in Varanasi in 2009, PHOTON is the brainchild of our esteemed founder and
                director, <strong>Jai Prakash Mishra</strong>. From its inception, &quot;JP Sir,&quot; as he is affectionately known, has
                been the main pillar of PHOTON's growth. His vision was singular and powerful: to provide
                a launchpad for students in Varanasi and across Purvanchal aspiring to join India's
                premier engineering and medical institutions.
              </p>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Under his leadership, we don't just teach, we mentor. We adapt to the evolving patterns of
                competitive exams, integrating innovative teaching methodologies and technology to
                provide an unparalleled learning experience, both at our Varanasi center and through our
                online platform for students across the nation.
              </p>
            </div>
            <div className="flex justify-center">
              {/* Placeholder for an image or illustration */}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-600 text-center mb-12">
            Our Journey Through Time
          </h2>
          <p className="max-w-2xl mx-auto text-center text-muted-foreground mb-12">
            Key milestones that mark our path of growth and achievement.
          </p>
          <div className="relative flex flex-col items-center">
            {timelineEvents.map((event, index) => (
              <div
                key={index}
                className={`flex w-full items-center mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 text-right' : 'md:pl-8 text-left'}`}>
                  <Card className="bg-white shadow-md rounded-lg p-6">
                    <CardTitle className="font-headline text-xl font-bold text-blue-600 mb-2">{event.year}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-gray-800 mb-2">{event.title}</CardDescription>
                    <CardContent className="text-muted-foreground p-0">{event.description}</CardContent>
                  </Card>
                </div>
                <div className="absolute hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white z-10">
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
              </div>
            ))}
            <div className="absolute h-full w-1 bg-blue-200 hidden md:block" />
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-600 text-center mb-12">
            Our Core Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <Card key={index} className="text-center p-6 bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">{principle.icon}</div>
                <CardTitle className="font-headline text-xl font-bold mb-2">{principle.title}</CardTitle>
                <CardContent className="text-muted-foreground p-0">{principle.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
            Ready to Begin Your Success Story?
          </h2>
          <p className="max-w-2xl mx-auto text-lg mb-8">
            Join a community of achievers. Explore our online courses or visit our center in
            Varanasi to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="font-headline bg-white text-blue-600 hover:bg-gray-100 shadow-lg px-8 py-6 text-base">
              <Link href="/courses">Explore Courses <ArrowRight className="ml-2 h-5 w-5"/></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-headline border-white text-white hover:bg-white/10 px-8 py-6 text-base">
              <a href="https://maps.app.goo.gl/your-location" target="_blank" rel="noopener noreferrer">Visit our Varanasi Center <ArrowRight className="ml-2 h-5 w-5"/></a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
