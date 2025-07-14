import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ArrowRight, Star, Users, BookOpen, Lightbulb, Award, FlaskConical, Microscope, GraduationCap, Calendar, Clock, Laptop, CircleCheck, ClipboardList, TrendingUp, BarChart, FileText, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Courses | PHOTON Coaching Varanasi",
  description: "Explore the comprehensive courses offered by PHOTON Coaching for IIT-JEE & NEET preparation, designed for success.",
};

const commonFeatures = [
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Advanced Concept Building" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Special Focus on Physics by JP. Mishra" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Performance Analysis & Feedback" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Rigorours & Error-free Test Series" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Strategic Workshop" },
];

const jeeMainAdvancedFeatures = [
  ...commonFeatures,
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Comprehensive JEE Main & Advanced coverage" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Personalized Mentorship" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Doubt Clearing Sessions" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Extensive Study Material" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Previous Year Paper Discussions" },
];

const jeeMainFeatures = [
  ...commonFeatures,
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Complete JEE Main Syllabus Coverage" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Shortcuts & Time-saving Techniques" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Rank Improvement Sessions" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Frequent Mock Tests" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Focused NCERT & Previous Year Papers" },
];

const jeeFoundationFeatures = [
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Strong conceptual clarity from basics" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Physical & NTPC Preparation" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Interactive & Engaging Classes" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Introduction to problem solving" },
  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Sync with school curriculum" },
];

const photonEdge = [
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "World-Class Faculty",
    description: "Led by the renowned Physics maestro, Jai Prakash Mishra, our distinguished team of IITians, NITians, and doctors are not just teachers, but mentors dedicated to your success.",
  },
  {
    icon: <BookOpen className="h-10 w-10 text-primary" />,
    title: "Unmatched Study Material",
    description: "Receive meticulously researched and regularly updated study material that is comprehensive, easy to understand, and perfectly aligned with the latest exam patterns.",
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: "Personalized Mentorship",
    description: "Benefit from our student-centric approach with small batch sizes, one-on-one doubt clearing sessions, and personalized feedback to track and improve your performance.",
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-primary" />,
    title: "Proven Track Record",
    description: "Join a legacy of excellence. Our consistent track record of producing top rankers in both JEE and NEET is a testament to our result-oriented methodology.",
  },
];

interface CourseProgramProps {
  title: string;
  description: string;
  facultyMentorship: string;
  features: { icon: JSX.Element; text: string }[];
  icon: JSX.Element;
  iconBgClass: string;
}

const CourseProgram: React.FC<CourseProgramProps> = ({ title, description, facultyMentorship, features, icon, iconBgClass }) => (
  <Card className="flex flex-col md:flex-row shadow-lg rounded-lg overflow-hidden mb-8 bg-white border border-blue-100">
    <div className={`flex-shrink-0 w-full md:w-1/4 ${iconBgClass} flex items-center justify-center p-6`}>
      <div className="text-white text-6xl">
        {icon}
      </div>
    </div>
    <div className="p-6 flex-grow">
      <h3 className="font-headline text-2xl font-bold text-blue-800 mb-4">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Faculty Mentorship</h4>
        <p className="text-muted-foreground text-sm">{facultyMentorship}</p>
      </div>
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Key Features</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center text-muted-foreground">
              {feature.icon}
              <span className="ml-2 text-sm">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 text-right">
        <Button asChild className="font-headline bg-orange-500 text-white hover:bg-orange-600 shadow-lg">
          <Link href="tel:7905927527">Enquire Now <ArrowRight className="ml-2 h-5 w-5"/></Link>
        </Button>
      </div>
    </div>
  </Card>
);

export default function CoursesPage() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-blue-50 py-20 md:py-32 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-blue-600 tracking-tighter mb-4">
            Your Gateway to Excellence
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground">
            Our meticulously crafted programs, available at our Varanasi center and online, are
            designed to transform aspirations into achievements.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="jee-engineering" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-blue-100 rounded-lg mb-8">
              <TabsTrigger value="jee-engineering" className="py-3 px-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md transition-all duration-200">Engineering (JEE)</TabsTrigger>
              <TabsTrigger value="neet-medical" className="py-3 px-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md transition-all duration-200">Medical (NEET)</TabsTrigger>
              <TabsTrigger value="academics-boards" className="py-3 px-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md transition-all duration-200">Academics (Boards)</TabsTrigger>
              <TabsTrigger value="online-program" className="py-3 px-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md transition-all duration-200">Online Program</TabsTrigger>
            </TabsList>

            <TabsContent value="jee-engineering">
              <CourseProgram
                title="JEE (Main + Advanced) Pinnacle Program"
                description="Our flagship program meticulously designed for aspirants aiming for a seat in the prestigious IITs. This course offers an exhaustive and in-depth coverage of both JEE Main and Advanced syllabus, transforming your potential into exceptional performance."
                facultyMentorship="Our experienced faculty, including IITians and NITians, provide personalized guidance to help you master complex concepts and problem-solving techniques."
                features={jeeMainAdvancedFeatures}
                icon={<Star className="h-full w-full" />}
                iconBgClass="bg-blue-500"
              />
              <CourseProgram
                title="JEE (Main) Accelerator Program"
                description="A focused program engineered to help students excel in the JEE Main exam and secure admission to top NITs, IIITs, and GFTIs. The curriculum is tailored to master the specific patterns and difficulty levels of JEE Main."
                facultyMentorship="Our seasoned faculty, under the mentorship of Physics maestro JP Mishra, provides intense coaching to strengthen fundamentals and improve speed and accuracy. Regular mock tests are held to track progress and refine exam-taking strategies for maximum output."
                features={jeeMainFeatures}
                icon={<FlaskConical className="h-full w-full" />}
                iconBgClass="bg-orange-500"
              />
              <CourseProgram
                title="JEE Foundation (Catalyst Program)"
                description="Start your journey to engineering excellence early. This course builds a rock-solid foundation in Physics, Chemistry, and Mathematics for school students (Class 9-10) and prepares them for future competitive exams like JEE and NEET. It's designed to give you a competitive edge for both school board exams and future competitive exams like JEE."
                facultyMentorship="Our young minds are led by nurturing mentors and a one-to-one scheme. Our mentors guide students in developing strong analytical skills and a problem-solving approach, ensuring a seamless transition to advanced concepts."
                features={jeeFoundationFeatures}
                icon={<GraduationCap className="h-full w-full" />}
                iconBgClass="bg-green-500"
              />
            </TabsContent>

            <TabsContent value="neet-medical">
              <CourseProgram
                title="NEET (UG) Target Program"
                description="A comprehensive program for medical aspirants, covering Physics, Chemistry, and Biology (Botany & Zoology) with a focus on NEET-UG syllabus and exam patterns."
                facultyMentorship="Our expert medical faculty, including experienced doctors and subject specialists, provide in-depth conceptual clarity and rigorous practice for NEET-UG."
                features={[
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Complete NEET-UG Syllabus Coverage" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Extensive Biology, Physics, Chemistry Modules" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Regular Mock Tests & Performance Analysis" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Doubt Resolution Sessions" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Previous Year Question Paper Discussions" },
                ]}
                icon={<Microscope className="h-full w-full" />}
                iconBgClass="bg-red-500"
              />
              <CourseProgram
                title="NEET Foundation Program"
                description="Build a strong foundation for NEET from an early stage. This program is designed for school students (Class 9-10) to develop scientific aptitude and problem-solving skills."
                facultyMentorship="Our dedicated mentors guide young students, fostering a love for science and preparing them for the competitive world of medical entrance exams."
                features={[
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Basic to Advanced Science Concepts" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Interactive Learning Modules" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Early Exposure to NEET Syllabus" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Practical & Application-Based Learning" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Regular Quizzes & Assessments" },
                ]}
                icon={<GraduationCap className="h-full w-full" />}
                iconBgClass="bg-purple-500"
              />
            </TabsContent>

            <TabsContent value="academics-boards">
              <CourseProgram
                title="Board Exam Excellence Program"
                description="Tailored programs for Class 11 and 12 students to excel in their board examinations. Focus on comprehensive syllabus coverage, writing skills, and time management."
                facultyMentorship="Experienced educators provide in-depth subject knowledge, board exam strategies, and personalized attention to ensure top scores."
                features={[
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Complete NCERT Syllabus Coverage" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Board Exam Pattern & Marking Scheme" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Subject-wise Revision & Practice" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Previous Year Board Paper Solving" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Effective Answer Writing Techniques" },
                ]}
                icon={<BookOpen className="h-full w-full" />}
                iconBgClass="bg-indigo-500"
              />
            </TabsContent>

            <TabsContent value="online-program">
              <CourseProgram
                title="PHOTON Live Online Classes"
                description="Experience PHOTON's quality coaching from anywhere with our interactive live online classes. Designed for flexibility and effectiveness."
                facultyMentorship="Access to our top faculty through live interactive sessions, doubt clearing, and personalized guidance, all from the comfort of your home."
                features={[
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Live Interactive Sessions" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Recorded Lectures for Revision" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Online Doubt Resolution Platform" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Digital Study Material & Tests" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Flexible Scheduling Options" },
                ]}
                icon={<Laptop className="h-full w-full" />}
                iconBgClass="bg-teal-500"
              />
              <CourseProgram
                title="PHOTON Self-Paced Learning"
                description="Learn at your own pace with our comprehensive self-paced courses. Ideal for students who prefer a flexible study schedule."
                facultyMentorship="Structured content with periodic assessments and support from our academic team to keep you on track."
                features={[
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Pre-recorded Video Lectures" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Extensive Question Banks" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Detailed Solutions & Explanations" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Progress Tracking & Analytics" },
                  { icon: <CircleCheck className="h-5 w-5 text-green-500" />, text: "Access to Online Community Forum" },
                ]}
                icon={<Calendar className="h-full w-full" />}
                iconBgClass="bg-gray-500"
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-50 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-600 mb-6">
            Master Physics with a Legend
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
            Struggling with Physics? You're not alone. It's the most common challenge for both JEE
            and NEET aspirants. At PHOTON, this is our greatest strength.
          </p>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
            Our founder and director, <strong>JAI PRAKASH MISHRA</strong>, is a renowned Physics educator with over 20 years of
            experience. His revolutionary teaching methods simplify the most complex topics, turning a point of
            weakness into your highest-scoring subject. Under his direct guidance, you will not just learn
            Physics; you will master it.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-600 text-center mb-12">
            The PHOTON Edge
          </h2>
          <p className="max-w-2xl mx-auto text-center text-muted-foreground mb-12">
            What makes our coaching methodology stand out from the rest.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {photonEdge.map((item, index) => (
              <Card key={index} className="text-center p-6 bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <CardTitle className="font-headline text-xl font-bold mb-2">{item.title}</CardTitle>
                <CardContent className="text-muted-foreground p-0">{item.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
