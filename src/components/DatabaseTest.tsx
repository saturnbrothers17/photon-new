'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function DatabaseTest() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testConnection = async () => {
    setStatus('Testing...');
    setError('');

    try {
      // Test 1: Check if table exists
      const { data, error: tableError } = await supabase
        .from('study_materials')
        .select('*')
        .limit(1);

      if (tableError) {
        setError(`Table error: ${tableError.message}`);
        return;
      }

      // Test 2: Check storage bucket
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        setError(`Storage error: ${bucketError.message}`);
        return;
      }

      setStatus(`✅ Database connected! Found ${data?.length || 0} materials. Storage buckets: ${buckets?.length || 0}`);
    } catch (err) {
      setError(`Connection failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-2">Database Connection Test</h3>
      <button 
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Connection
      </button>
      {status && <p className="mt-2 text-green-600">{status}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
