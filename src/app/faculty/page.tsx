import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, FlaskConical, Sigma, Microscope, Award } from 'lucide-react';
import Image from "next/image";

export const metadata: Metadata = {
  title: "Faculty | PHOTON Coaching Varanasi",
  description: "Meet the dedicated and experienced faculty at PHOTON Coaching, led by renowned physicist Jai Prakash Mishra.",
};

export default function FacultyPage() {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-100 to-blue-50 py-20 md:py-32 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-blue-800 tracking-tighter mb-4">
            Meet Our Mentors
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            At PHOTON, your success is mentored by a handpicked team of masters. Under the direct
            leadership of our founder, renowned physicist <span className="font-semibold text-blue-700">Jai Prakash Mishra</span>, our departments are
            guided by veteran educators, each with over 15 years of experience. This is your personal
            team of experts dedicated to your dream.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="relative flex flex-col md:flex-row items-center bg-blue-50 p-8 rounded-lg shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-transparent opacity-50 pointer-events-none"></div>
            <div className="flex-shrink-0 text-center md:text-left md:mr-8 mb-8 md:mb-0 relative z-10">
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-blue-200 flex items-center justify-center mx-auto md:mx-0 mb-4">
                <Zap className="w-16 h-16 md:w-24 md:h-24 text-blue-600" />
              </div>
              <p className="font-semibold text-blue-700 text-lg">The Visionary</p>
              <p className="text-sm text-muted-foreground">The Powerhouse of Physics</p>
            </div>
            <div className="flex-grow relative z-10">
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Award className="w-3 h-3 mr-1" /> Founder & Director
              </div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-blue-800 mb-2">Jai Prakash Mishra</h2>
              <p className="text-lg text-blue-600 mb-4">Founder, Director & Physics Maestro</p>
              <p className="text-muted-foreground mb-6">
                The heart and soul of PHOTON, JP Sir is a legendary Physics educator whose revolutionary teaching
                methods have transformed the subject from a challenge into a strength for thousands of students. His
                personal guidance is the cornerstone of our success.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-blue-200 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">20+ Years of Mentoring Excellence</span>
                <span className="bg-blue-200 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">Physics (JEE & NEET)</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Department Heads Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-blue-50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-blue-800 mb-12">
            Expert Department Heads
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
            Each subject is spearheaded by highly experienced faculty who are masters in
            their domain.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800 mb-2">Chemistry Department</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Our Chemistry faculty is comprised of veteran educators with over 15 years of
                experience. They are masters at simplifying complex topics in Physical, Organic, and
                Inorganic Chemistry, ensuring students build a rock-solid foundation for both JEE and NEET.
              </p>
              <span className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">15+ Years of Experience</span>
              <span className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full ml-2">Chemistry (JEE & NEET)</span>
            </Card>

            <Card className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Sigma className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800 mb-2">Mathematics Department</h3>
              <p className="text-muted-foreground text-sm mb-4">
                The Mathematics department is powered by brilliant minds with over 15 years of dedicated
                JEE coaching experience. They specialize in developing strategic problem-solving skills,
                speed, and accuracy, turning mathematical challenges into scoring opportunities.
              </p>
              <span className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">15+ Years of Experience</span>
              <span className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full ml-2">Mathematics (JEE)</span>
            </Card>

            <Card className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Microscope className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl text-blue-800 mb-2">Biology Department</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Our Biology faculty for NEET is led by seasoned experts with 15+ years of experience in medical
                entrance coaching. Their teaching methodology focuses on deep conceptual understanding of
                the NCERT syllabus, making Biology a high-scoring subject for our aspirants.
              </p>
              <span className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">15+ Years of Experience</span>
              <span className="bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded-full ml-2">Biology (NEET)</span>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
