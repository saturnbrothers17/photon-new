'use client';

import { signIn } from 'next-auth/react';

export default function GoogleDriveLogin() {
  const handleLogin = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/dashboard', // Redirect after login
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Sign in with Google Drive
    </button>
  );
}
