'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Lock, BookOpen, Atom, GraduationCap, Shield } from 'lucide-react';

export default function FacultyPortalPage() {
  const [photonId, setPhotonId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is already logged in, redirect to dashboard
          router.push('/teacher-dashboard');
          return;
        }
      } catch (error) {
        console.log('Auth check error:', error);
      }
      setCheckingAuth(false);
    };
    
    checkAuth();
  }, [supabase, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = photonId.includes('@') ? photonId : `${photonId}@photon`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError('Login failed. Please check your Photon ID and password.');
        toast.error('Invalid Photon ID or password');
      } else {
        toast.success('Welcome to PHOTON Faculty Portal!');
        setTimeout(() => {
          router.push('/teacher-dashboard');
        }, 500);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      toast.error('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing PHOTON Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 border-2 border-white rounded-full"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-white to-blue-100 p-4 rounded-full shadow-2xl">
                <Atom className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">
              PHOTON
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-blue-200" />
              <p className="text-blue-200 text-lg font-medium">Faculty Portal</p>
            </div>
            <p className="text-blue-300 text-sm">Advanced Learning Management System</p>
          </div>

          {/* Sign In Card */}
          <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-gray-800">
                <Shield className="h-6 w-6 text-blue-600" />
                Faculty Access
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Enter your PHOTON credentials to access the teacher dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Photon ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                    <Input
                      type="text"
                      value={photonId}
                      onChange={(e) => setPhotonId(e.target.value)}
                      placeholder="Enter your Photon ID"
                      className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Example: teacher.physics, admin.chemistry
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Photon Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5 mr-2" />
                      Access Dashboard
                    </>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      Secure Faculty Access
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Your credentials are provided by the PHOTON administration. 
                      This portal provides access to student management, test creation, 
                      and analytics tools.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-blue-200 text-sm">
              Need assistance? Contact PHOTON Technical Support
            </p>
            <p className="text-blue-300 text-xs mt-2">
              &copy; 2024 PHOTON Educational Systems. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
