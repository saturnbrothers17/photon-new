"use client";

import { LiveTestsSection } from '@/components/student-corner/LiveTestsSection';
import PagePreloader from '@/components/common/PagePreloader';
import { Button } from '@/components/ui/button';

// This is the main page for the student's mock test section.
// It serves as a container for the different test sections (Live, Upcoming, Completed).
export default function MockTestsPage() {
  return (
    <PagePreloader>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
            <h1 className="font-headline text-2xl font-bold text-gray-800">Mock Tests</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline">My Performance</Button>
              <Button>View Syllabus</Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 py-8">
          {/* The LiveTestsSection is now self-contained and fetches its own data correctly. */}
          <LiveTestsSection />

          {/* TODO: Implement Upcoming and Completed test sections */}
          {/* These sections will need to be converted to fetch their own data */}
          {/* from firebase-data-manager.ts, similar to LiveTestsSection. */}
        </main>

        {/* Placeholder for Test Statistics */}
        <section className="py-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="font-headline text-3xl font-bold mb-8 text-center">Your Test Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">0</div>
                <div className="text-sm opacity-90">Tests Taken</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">0</div>
                <div className="text-sm opacity-90">Tests Passed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">0%</div>
                <div className="text-sm opacity-90">Avg Percentile</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">0</div>
                <div className="text-sm opacity-90">Best Rank</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PagePreloader>
  );
}