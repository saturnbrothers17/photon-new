"use client";

import { TestData } from '@/lib/test-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Clock, Calendar, Info } from 'lucide-react';

interface TestDetailsProps {
  test: TestData;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "published": return "bg-green-100 text-green-800";
    case "draft": return "bg-yellow-100 text-yellow-800";
    case "archived": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "JEE Main": return "bg-blue-100 text-blue-800";
    case "JEE Advanced": return "bg-purple-100 text-purple-800";
    case "NEET": return "bg-green-100 text-green-800";
    case "Chapter Test": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function TestDetails({ test }: TestDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{test.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge className={getTypeColor(test.subject)}>{test.subject}</Badge>
          <Badge className={getStatusColor(test.is_published ? 'Published' : 'Draft')}>
            {test.is_published ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span>{test.questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{test.class_level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Created: {new Date(test.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>Duration: {test.duration_minutes} minutes</span>
          </div>
        </div>
        <div>
          <h4 className="font-semibold flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-gray-500" />
            Instructions
          </h4>
          <p className="text-gray-700 whitespace-pre-wrap">{test.subject} - Class {test.class_level}</p>
        </div>
      </CardContent>
    </Card>
  );
}
