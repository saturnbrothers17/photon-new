"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const teachers = [
  { email: 'sp8@photon', name: 'Shiv Prakash Yadav' },
  { email: 'mk6@photon', name: 'Mahavir Kesari' },
  { email: 'ak5@photon', name: 'AK Mishra' }
];

export default function SetupTeachers() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const createTeacher = async (teacher: any) => {
    try {
      const response = await fetch('/api/auth/signup-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: teacher.email,
          password: teacher.email, // Use full email as password (sp8@photon, mk6@photon, ak5@photon)
          name: teacher.name
        })
      });

      const data = await response.json();
      return {
        ...teacher,
        success: response.ok,
        message: data.message || data.error || 'Unknown error'
      };
    } catch (error: any) {
      return {
        ...teacher,
        success: false,
        message: error.message
      };
    }
  };

  const createAllTeachers = async () => {
    setLoading(true);
    setResults([]);

    const teacherResults = [];
    for (const teacher of teachers) {
      const result = await createTeacher(teacher);
      teacherResults.push(result);
      setResults([...teacherResults]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              PHOTON Teacher Account Setup
            </CardTitle>
            <p className="text-center text-gray-600">
              Create missing teacher accounts for the dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <h3 className="font-semibold">Teachers to be created:</h3>
              {teachers.map((teacher) => (
                <div key={teacher.email} className="flex justify-between items-center p-3 bg-gray-100 rounded">
                  <div>
                    <p className="font-medium">{teacher.name}</p>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                  </div>
                  <p className="text-sm text-gray-500">Password: {teacher.email}</p>
                </div>
              ))}
            </div>

            <Button 
              onClick={createAllTeachers} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating Accounts...' : 'Create All Teacher Accounts'}
            </Button>

            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Results:</h3>
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    <p className="font-medium">{result.name} ({result.email})</p>
                    <p className="text-sm">{result.message}</p>
                  </div>
                ))}
              </div>
            )}

            {results.length > 0 && results.every(r => r.success) && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800 font-medium">✅ All accounts created successfully!</p>
                <p className="text-sm text-green-700 mt-2">
                  You can now test the logins at <a href="/faculty-portal" className="underline">/faculty-portal</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
