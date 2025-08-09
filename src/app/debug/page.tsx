"use client";

import { useEffect, useState } from 'react';
import AuthDebug from '@/components/debug/AuthDebug';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug - Supabase & Authentication</h1>
        
        <div className="space-y-8">
          {/* Authentication Debug */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Authentication & UUID Testing</h2>
            <AuthDebug />
          </div>

          {/* Supabase Connection Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Supabase Connection</h2>
            <div className="space-y-2">
              <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Supabase configuration loaded</span>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>OpenRouter Key:</strong> {process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Gemini Key:</strong> {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}