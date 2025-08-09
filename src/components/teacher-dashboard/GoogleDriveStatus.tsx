'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Cloud, Settings, User } from 'lucide-react';

export default function GoogleDriveStatus() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const isAuth = localStorage.getItem('googleDriveAuth') === 'true';
    const tokens = localStorage.getItem('googleDriveTokens');
    
    if (isAuth && tokens) {
      setAuthStatus('connected');
      // Try to extract email from tokens if available
      try {
        const tokenData = JSON.parse(tokens);
        // Note: We don't actually have user info in tokens, this is just for demo
        setUserEmail('anitamishravns1973@gmail.com'); // Your email
      } catch (e) {
        console.error('Error parsing tokens:', e);
      }
    } else {
      setAuthStatus('disconnected');
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('googleDriveAuth');
    localStorage.removeItem('googleDriveTokens');
    setAuthStatus('disconnected');
    setUserEmail(null);
  };

  const testOAuth = async () => {
    try {
      const response = await fetch('/api/auth/google');
      const result = await response.json();
      
      if (result.success) {
        window.location.href = result.authUrl;
      } else {
        alert('OAuth test failed: ' + result.error);
      }
    } catch (error) {
      alert('OAuth test failed: ' + error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Google Drive Connection Status
        </CardTitle>
        <CardDescription>
          Current authentication status and quick actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            {authStatus === 'connected' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            )}
            <div>
              <p className="font-medium">
                {authStatus === 'connected' ? 'Connected' : 'Not Connected'}
              </p>
              {userEmail && (
                <p className="text-sm text-gray-600">{userEmail}</p>
              )}
            </div>
          </div>
          <Badge variant={authStatus === 'connected' ? 'default' : 'secondary'}>
            {authStatus === 'checking' ? 'Checking...' : 
             authStatus === 'connected' ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button 
            onClick={testOAuth}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Cloud className="h-4 w-4" />
            Test OAuth
          </Button>
          
          <Button 
            onClick={checkAuthStatus}
            variant="outline"
            size="sm"
          >
            Refresh Status
          </Button>
          
          {authStatus === 'connected' && (
            <Button 
              onClick={clearAuth}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Disconnect
            </Button>
          )}
        </div>

        {authStatus === 'connected' && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ Great! You're connected to Google Drive. The automatic backup system is ready to use.
            </p>
          </div>
        )}

        {authStatus === 'disconnected' && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              🔗 Click "Test OAuth" to connect to Google Drive and enable automatic backups.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}