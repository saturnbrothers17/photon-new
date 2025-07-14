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
        <section data-last-deployment={new Date().toISOString()} className="relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-48 -left-32 w-[400px] h-[400px] bg-blue-400 opacity-60 rounded-full blur-3xl mix-blend-multiply animate-blob" style={{animationDelay:'0s'}} />
            <div className="absolute top-1/2 right-[-200px] w-[600px] h-[600px] bg-cyan-300 opacity-70 rounded-full blur-3xl mix-blend-multiply animate-blob" style={{animationDelay:'4s'}} />
            <div className="absolute bottom-[-150px] left-1/2 w-[350px] h-[350px] bg-indigo-300 opacity-50 rounded-full blur-3xl mix-blend-multiply animate-blob" style={{animationDelay:'8s'}} />
          </div>
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
                  <Button asChild size="lg" className="font-headline bg-orange-600 text-white hover:bg-orange-700 shadow-lg px-8 py-6 text-base transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
                    <a href="tel:7905927527">Enquire Now <ArrowRight className="ml-2 h-5 w-5"/></a>
                  </Button>
                   <Button asChild size="lg" variant="outline" className="font-headline bg-orange-600 text-white hover:bg-orange-700 shadow-lg px-8 py-6 text-base transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
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
                  <Button asChild size="lg" className="w-full md:w-auto bg-orange-600 text-white hover:bg-orange-700 shadow-lg px-10 py-6 text-base font-bold rounded-lg">
                      <Link href="tel:7905927527">Register Now <ArrowRight className="ml-2 h-4 w-4"/></Link>
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