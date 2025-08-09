"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const teachers = [
  { email: 'sp8@photon', password: 'sp8@photon', name: 'Shiv Prakash Yadav' },
  { email: 'mk6@photon', password: 'mk6@photon', name: 'Mahavir Kesari' },
  { email: 'ak5@photon', password: 'ak5@photon', name: 'AK Mishra' }
];

export default function ManualSetup() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">
              Manual Teacher Account Setup Required
            </CardTitle>
            <p className="text-center text-gray-600">
              Database error occurred. Please create accounts manually in Supabase Dashboard.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Setup Instructions</h3>
              <p className="text-yellow-700">
                Go to your <strong>Supabase Dashboard</strong> → <strong>Authentication</strong> → <strong>Users</strong> → <strong>Add User</strong>
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Create these 3 teacher accounts:</h3>
              
              {teachers.map((teacher, index) => (
                <div key={teacher.email} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{index + 1}. {teacher.name}</h4>
                      <p className="text-gray-600">Teacher Account #{index + 1}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium text-sm text-gray-700">Email:</p>
                      <p className="font-mono text-blue-600">{teacher.email}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium text-sm text-gray-700">Password:</p>
                      <p className="font-mono text-green-600">{teacher.password}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>✅ Email Confirm:</strong> Make sure to check this box when creating the user
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h3 className="font-semibold text-green-800 mb-2">📋 Step-by-Step Process</h3>
              <ol className="list-decimal list-inside space-y-1 text-green-700">
                <li>Open Supabase Dashboard in a new tab</li>
                <li>Navigate to Authentication → Users</li>
                <li>Click "Add User" button</li>
                <li>Enter the email and password for each teacher</li>
                <li><strong>Important:</strong> Check "Email Confirm" ✅</li>
                <li>Click "Create User"</li>
                <li>Repeat for all 3 teachers</li>
              </ol>
            </div>

            <div className="text-center space-y-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="https://supabase.com/dashboard" target="_blank">
                  Open Supabase Dashboard
                </Link>
              </Button>
              
              <div className="text-sm text-gray-600">
                After creating all accounts, test them at:
                <br />
                <Link href="/faculty-portal" className="text-blue-600 underline font-medium">
                  /faculty-portal
                </Link>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">🎯 Expected Results After Setup:</h3>
              <ul className="space-y-1 text-sm">
                <li>• <strong>sp8@photon</strong> → "Welcome, Shiv Prakash Yadav"</li>
                <li>• <strong>mk6@photon</strong> → "Welcome, Mahavir Kesari"</li>
                <li>• <strong>ak5@photon</strong> → "Welcome, AK Mishra"</li>
                <li>• <strong>jp7@photon</strong> → "Welcome, Jai Prakash Mishra" (existing)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
