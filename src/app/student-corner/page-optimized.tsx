import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the main content
const StudentCornerContent = dynamic(
  () => import('@/components/student-corner/StudentCornerContent'),
  { 
    loading: () => <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>,
    ssr: true 
  }
);

export const metadata: Metadata = {
  title: 'Student Corner | PHOTON - Resources for JEE & NEET Students',
  description: 'Access study materials, test results, announcements, and resources for JEE & NEET preparation at PHOTON coaching institute in Varanasi.',
  keywords: "student portal, study materials, test results, jee resources, neet resources, photon varanasi, student corner",
};

export default function StudentCornerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StudentCornerContent />
    </Suspense>
  );
}
