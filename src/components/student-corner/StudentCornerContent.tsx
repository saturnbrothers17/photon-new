'use client';

import { ArrowRight, Award, Target, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Lazy load heavy components. Corrected to handle named export.
const LiveTestsSection = dynamic(
  () => import('@/components/student-corner/LiveTestsSection').then(mod => mod.LiveTestsSection),
  { 
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
    ssr: false 
  }
);

const quickLinks = [
  {
    icon: <Target className="h-8 w-8" />,
    title: "Mock Tests",
    description: "JEE & NEET mock tests with detailed analysis",
    href: "/student-corner/mock-tests",
    color: "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300"
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    title: "Test Results",
    description: "View your performance and detailed analysis",
    href: "/student-corner/test-results",
    color: "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Rankings",
    description: "Check your position in the leaderboard",
    href: "/student-corner/rankings",
    color: "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
  }
];

const StudentCornerContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-slate-800">
      <section className="relative py-20 md:py-32 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 animate-gradient-x"></div>
        <div className="relative container mx-auto px-4">
          <Badge className="mb-4 bg-white/20 text-white backdrop-blur-sm">Welcome to Your Learning Hub</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            Student Corner
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90 drop-shadow-md">
            Your personalized gateway to success in JEE & NEET. Access premium study materials, take mock tests, track your progress, and achieve your dreams.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`group relative block p-6 rounded-2xl ${link.color} transform hover:scale-105 transition-all duration-300`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    {link.icon}
                  </div>
                  <h3 className="text-xl font-bold">{link.title}</h3>
                  <p className="text-sm opacity-90">{link.description}</p>
                  <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
          <LiveTestsSection />
        </div>
      </section>
    </div>
  );
};

export default StudentCornerContent;
