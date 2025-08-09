import { Download, FileText, Trophy, Users, Calendar, ArrowRight, Clock, Star, TrendingUp, Award, Target, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Metadata } from 'next';
import { LiveTestsSection } from '@/components/student-corner/LiveTestsSection';

export const metadata: Metadata = {
  title: 'Student Corner | PHOTON - Resources for JEE & NEET Students',
  description: 'Access study materials, test results, announcements, and resources for JEE & NEET preparation at PHOTON coaching institute in Varanasi.',
  keywords: "student portal, study materials, test results, jee resources, neet resources, photon varanasi, student corner",
};

const quickLinks = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Study Materials",
    description: "View comprehensive notes and study resources",
    href: "/student-corner/study-materials",
    color: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Mock Tests",
    description: "JEE & NEET mock tests with detailed analysis",
    href: "/student-corner/mock-tests",
    color: "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300"
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Live Classes",
    description: "Join live interactive classes & doubt sessions",
    href: "/student-corner/live-classes",
    color: "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Results",
    description: "Track your progress & view detailed performance",
    href: "/student-corner/results",
    color: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
  }
];

export default function StudentCorner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 px-6 py-3 text-sm font-semibold text-blue-600 dark:text-blue-300 mb-6 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50">
              <Users className="h-5 w-5 mr-2" />
              Welcome to Your Learning Hub
            </div>
            
            <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Student Corner
              </span>
            </h1>
            
            <p className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your personalized gateway to success in JEE & NEET. Access premium study materials, take mock tests, track your progress, and achieve your dreams.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300">
                <Link href="/student-corner/mock-tests">Start Testing</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 px-8 py-3 text-lg">
                <Link href="/student-corner/live-classes">Live Classes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.href} className="group">
                <Card className="group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-8 relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${link.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {link.icon}
                    </div>
                    <h3 className="font-headline text-xl font-bold text-gray-900 dark:text-white mb-3">{link.title}</h3>
                    <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{link.description}</p>
                    <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Explore Now <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>





      {/* Dynamic Tests Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Live Tests & Practice
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Practice with real-time tests and get instant feedback on your performance.
            </p>
          </div>
          <LiveTestsSection />
        </div>
      </div>

      {/* Contact Support */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url(&quot;data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)] opacity-50" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white mb-6 border border-white/20">
              <Users className="h-5 w-5 mr-2" />
              24/7 Student Support
            </div>
            
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-6">
              Need Help with Your Preparation?
            </h2>
            
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our dedicated student support team is here to help you with any queries regarding your studies, tests, or materials. Get expert guidance whenever you need it.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl shadow-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-white/30">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300">
                <Link href="tel:9450545318">Call: 9450545318</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}