"use client";

import { TestData } from '@/lib/test-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  test: TestData;
}

const mockAnalyticsData = [
  { name: '0-20%', students: 5 },
  { name: '21-40%', students: 12 },
  { name: '41-60%', students: 25 },
  { name: '61-80%', students: 18 },
  { name: '81-100%', students: 10 },
];

export default function AnalyticsChart({ test }: AnalyticsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Distribution - {test.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer>
            <BarChart
              data={mockAnalyticsData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
