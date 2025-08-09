'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error);
        }

        localStorage.setItem('googleDriveTokens', JSON.stringify(result.tokens));
        localStorage.setItem('googleDriveAuth', 'true');
        
        setStatus('success');
        setMessage('Successfully connected to Google Drive!');
        
        setTimeout(() => {
          router.push('/teacher-dashboard');
        }, 3000);
        
      } catch (error: any) {
        setStatus('error');
        setMessage(`Failed to complete authentication: ${error.message}`);
        console.error('Auth error:', error);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Connecting...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-green-700">
                Redirecting to dashboard in 3 seconds...
              </p>
              <Button 
                onClick={() => router.push('/teacher-dashboard')}
                className="w-full"
              >
                Go to Dashboard Now
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/teacher-dashboard')}
                variant="outline"
                className="w-full"
              >
                Return to Dashboard
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// This is the main page component that Next.js will render
export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
