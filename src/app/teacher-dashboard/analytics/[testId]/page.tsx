import { getAllTests, getTestById } from '@/lib/test-data';
import AnalyticsChart from './analytics-chart';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  const tests = getAllTests();
  return tests.map((test) => ({
    testId: test.id.toString(),
  }));
}

export default function TestAnalyticsPage({ params }: { params: { testId: string } }) {
  const testId = Number(params.testId);
  const test = getTestById(testId);

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Test not found</h1>
          <p>The test you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/teacher-dashboard">
              &larr; Back to Dashboard
            </Link>
          </Button>
        </div>
        <AnalyticsChart test={test} />
      </div>
    </div>
  );
}


